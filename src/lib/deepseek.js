// Cliente mínimo da API do DeepSeek (formato compatível com OpenAI), usado
// pelos endpoints de catálogo e de reviews. O vendedor-agente (api/vendedor.js)
// fala com a mesma API, mas em modo texto livre, e continua com o fetch dele.
//
// Diferença importante em relação ao Gemini, que estava aqui antes: o DeepSeek
// não tem equivalente ao `responseSchema`. O `response_format` de tipo
// `json_schema` responde "This response_format type is unavailable now" — só
// existe `json_object`, que garante JSON *sintaticamente* válido e nada mais.
// Consequência prática: a forma vai descrita no prompt, e a validação de
// verdade é responsabilidade de quem chama (Zod + checagem de contagem).
// Em particular, o `minItems`/`maxItems` que o schema do Gemini garantia agora
// precisa ser conferido em código — ver `ajustarQuantidade` nos endpoints.

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

export const MODELO_PADRAO = 'deepseek-v4-flash'

// o modelo às vezes embrulha em cerca de markdown mesmo com json_object e com
// instrução explícita no prompt — tira antes de tentar o parse
function limparCerca(texto) {
  const limpo = texto.trim()
  if (!limpo.startsWith('```')) return limpo
  return limpo
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

/**
 * Pede um JSON ao DeepSeek e devolve o objeto já parseado.
 * Lança em timeout, erro HTTP, resposta vazia ou JSON inválido — quem chama
 * decide entre retry e fallback.
 */
export async function pedirJson({ chave, sistema, usuario, maxTokens, temperatura = 1, timeoutMs, rotulo = 'chamada' }) {
  // O modo json_object recusa (HTTP 400) qualquer requisição que não tenha a
  // palavra "json" nas mensagens. Falha fácil de causar sem querer ao mexer no
  // texto do prompt, e o 400 não diz isso — melhor estourar aqui, explicado.
  if (!/json/i.test(sistema) && !/json/i.test(usuario)) {
    throw new Error('prompt precisa mencionar "json" — exigência do response_format json_object')
  }

  // AbortSignal.timeout cancela a requisição de verdade. Um Promise.race só
  // ignoraria a resposta: a chamada seguiria correndo e queimando tokens pagos.
  const resposta = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${chave}`,
    },
    body: JSON.stringify({
      model: MODELO_PADRAO,
      messages: [
        { role: 'system', content: sistema },
        { role: 'user', content: usuario },
      ],
      response_format: { type: 'json_object' },
      // O deepseek-v4-flash raciocina por padrão, e aqui isso é desperdício
      // puro: os tokens de raciocínio são cobrados como saída, atrasam a
      // resposta e não melhoram em nada um gerador de produto satírico.
      // Pior: com o prompt longo o modelo às vezes consumia o orçamento inteiro
      // pensando e devolvia `content` vazio, o que derrubava a primeira
      // tentativa e forçava o retry (2x o custo, ~60s de latência).
      // "none" some com o reasoning_content de vez; "minimal" ainda raciocina.
      reasoning_effort: 'none',
      max_tokens: maxTokens,
      temperature: temperatura,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => '')
    throw new Error(`DeepSeek ${resposta.status}: ${detalhe.slice(0, 200)}`)
  }

  const dados = await resposta.json()
  const escolha = dados.choices?.[0]
  const conteudo = escolha?.message?.content

  if (!conteudo) {
    // quase sempre significa finish_reason 'length': o modelo gastou o orçamento
    // de tokens e não sobrou nada pro JSON. O detalhe importa pra saber se é
    // caso de aumentar maxTokens ou de encurtar o que se está pedindo.
    const uso = dados.usage ?? {}
    throw new Error(
      `DeepSeek devolveu conteúdo vazio (finish_reason=${escolha?.finish_reason}, ` +
        `completion=${uso.completion_tokens}, raciocínio=${uso.completion_tokens_details?.reasoning_tokens})`
    )
  }

  // custo é o gargalo do projeto agora (o Gemini era cota/dia, o DeepSeek é
  // saldo). `hit` alto confirma que o prefixo estático do prompt está sendo
  // cacheado — se cair pra perto de zero, alguém interpolou valor variável no
  // prompt de sistema e a conta vai subir sem nada quebrar visivelmente.
  const uso = dados.usage
  if (uso) {
    console.log(
      `[deepseek] ${rotulo}: entrada=${uso.prompt_tokens} (cache ${uso.prompt_cache_hit_tokens ?? 0}) ` +
        `saída=${uso.completion_tokens}`
    )
  }

  return JSON.parse(limparCerca(conteudo))
}
