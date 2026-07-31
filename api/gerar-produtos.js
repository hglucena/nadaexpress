import { z } from 'zod'
import produtosOffline from '../src/data/fallback/produtos.js'
import { pedirJson } from '../src/lib/deepseek.js'

const JANELA_MS = 60_000
const LIMITE_POR_JANELA = 10
// 8 produtos de título longo + specs é uma resposta grande; o DeepSeek leva
// mais que o Gemini levava aqui. Medido em ~25-30s no pior caso.
const TIMEOUT_MS = 45_000
const contagemPorIp = new Map()

function estaBloqueado(ip) {
  const agora = Date.now()
  const registro = contagemPorIp.get(ip)
  if (!registro || agora - registro.inicio > JANELA_MS) {
    contagemPorIp.set(ip, { inicio: agora, total: 1 })
    return false
  }
  registro.total += 1
  return registro.total > LIMITE_POR_JANELA
}

// specs pode vir como objeto (o que o app usa) ou como array de {chave, valor}
// — o formato que o schema do Gemini exigia. Sem schema forçando a forma, o
// modelo escolhe sozinho, então aceitamos os dois e normalizamos depois.
const Specs = z.union([
  z.record(z.string(), z.coerce.string()),
  z.array(z.object({ chave: z.string(), valor: z.coerce.string() })),
])

// Tudo numérico entra por coerce: sem schema no provedor, o modelo manda
// "89.90" como string e "4.5 estrelas" de spec numérica sem o menor pudor.
// Rejeitar por causa disso queimaria uma chamada paga por um detalhe que dá
// pra converter — o que importa validar é a regra de negócio, não o tipo.
const ProdutoGerado = z.object({
  titulo: z.string().min(1),
  preco: z.coerce.number().positive(),
  precoOriginal: z.coerce.number().positive(),
  nota: z.coerce.number().min(0).max(5),
  vendidos: z.coerce.number().min(0),
  categoria: z.string().min(1),
  descricao: z.string().min(1),
  specs: Specs,
})

const RespostaGerada = z.object({ produtos: z.array(ProdutoGerado).min(1) })

function specsComoObjeto(specs) {
  if (!Array.isArray(specs)) return specs
  return Object.fromEntries(specs.map((item) => [item.chave, item.valor]))
}

const PROMPT_SISTEMA = `Você gera produtos falsos pro NadaExpress, um marketplace satírico onde nada é real — nenhum produto existe de verdade, é uma crítica a dark patterns de e-commerce.

Gere produtos no estilo de anúncio barato traduzido automaticamente, mal revisado:
- Título: 15 a 25 palavras, cheio de palavras-chave empilhadas sem conectivo natural, parece traduzido automaticamente. Maiúscula na maioria das palavras.
- Descrição: 1 ou 2 frases que contradizem alguma informação do título, ou trazem uma ressalva estranha e deslocada.
- Specs: pelo menos um item com unidade trocada ou fisicamente impossível (peso em metros, voltagem em litros, capacidade em Bluetooth — esse tipo de erro).
- nota entre 3.0 e 5.0, vendidos entre 10 e 20000.
- preco sempre menor que precoOriginal.
- categoria: repete a categoria pedida.

FORMATO DA RESPOSTA — responda um objeto JSON exatamente nesta forma:
{"produtos":[{"titulo":"string","preco":29.9,"precoOriginal":99.9,"nota":4.3,"vendidos":1200,"categoria":"string","descricao":"string","specs":{"chave":"valor","outraChave":"outro valor"}}]}

- "specs" é um objeto de 3 a 5 pares chave/valor, todos string.
- "preco" e "precoOriginal" são números, sem símbolo de moeda e sem aspas.
- "vendidos" é inteiro. "nota" é número com uma casa decimal.
- O array "produtos" precisa ter EXATAMENTE a quantidade pedida de itens — nem um a mais, nem um a menos.

Responda só com o JSON. Sem markdown, sem crase, sem texto antes ou depois, sem comentário.`

function produtosFallback(categoria, quantidade) {
  const daCategoria = produtosOffline.filter((produto) => produto.categoria === categoria)
  const base = daCategoria.length > 0 ? daCategoria : produtosOffline
  const inicio = Math.floor(Math.random() * base.length)
  // cicla pela categoria (que pode ter menos itens que a quantidade pedida) em vez de cortar
  return Array.from({ length: quantidade }, (_, indice) => ({
    ...base[(inicio + indice) % base.length],
    id: `fallback-${Date.now()}-${indice}`,
  }))
}

// O DeepSeek não força tamanho de array (não existe minItems sem schema), e
// pedir a quantidade no texto do prompt não garante nada — mesmo problema que
// o Gemini tinha antes do minItems. Em vez de queimar uma chamada paga em
// retry, completa com o dataset offline; sobrando, corta.
function ajustarQuantidade(produtos, categoria, quantidade) {
  if (produtos.length === quantidade) return produtos
  if (produtos.length > quantidade) return produtos.slice(0, quantidade)
  const faltam = quantidade - produtos.length
  console.warn(`gerar-produtos: modelo devolveu ${produtos.length}/${quantidade}, completando ${faltam} do offline`)
  return [...produtos, ...produtosFallback(categoria, faltam)]
}

async function gerarComDeepSeek(chave, categoria, quantidade) {
  const dados = await pedirJson({
    chave,
    rotulo: `produtos x${quantidade} (${categoria})`,
    sistema: PROMPT_SISTEMA,
    usuario: `Gere ${quantidade} produtos da categoria "${categoria}".`,
    maxTokens: 4000,
    // 1.1 quebrava o JSON com frequência (aspas escapadas fora de lugar). A
    // variedade do catálogo vem do prompt e do rodízio de categorias, não da
    // temperatura — 0.85 mantém a graça e para de corromper a saída.
    temperatura: 0.85,
    timeoutMs: TIMEOUT_MS,
  })

  const validado = RespostaGerada.parse(dados)

  return validado.produtos.map((produto, indice) => {
    const precoOriginal = Math.round(produto.precoOriginal * 100) / 100
    // o prompt pede preco < precoOriginal, mas não dá pra confiar: desconto
    // negativo quebraria a fachada do site inteiro
    const preco = Math.round(Math.min(produto.preco, precoOriginal * 0.99) * 100) / 100
    const desconto = Math.max(1, Math.round((1 - preco / precoOriginal) * 100))
    return {
      id: `gerado-${Date.now()}-${indice}`,
      ...produto,
      specs: specsComoObjeto(produto.specs),
      vendidos: Math.round(produto.vendidos),
      preco,
      precoOriginal,
      desconto,
    }
  })
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return Response.json({ erro: 'Método não permitido, use POST' }, { status: 405 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? 'desconhecido'
    if (estaBloqueado(ip)) {
      return Response.json({ erro: 'Muitas requisições, tenta de novo em um minuto' }, { status: 429 })
    }

    const corpo = await request.json().catch(() => ({}))
    const categoria = corpo.categoria ?? 'Geral'
    const quantidade = Math.min(Number(corpo.quantidade) || 4, 8)

    const chave = process.env.DEEPSEEK_API_KEY
    if (!chave) {
      return Response.json({ produtos: produtosFallback(categoria, quantidade), fonte: 'fallback-sem-chave' })
    }

    try {
      const produtos = await gerarComDeepSeek(chave, categoria, quantidade)
      return Response.json({ produtos: ajustarQuantidade(produtos, categoria, quantidade), fonte: 'deepseek' })
    } catch (erro1) {
      console.error('gerar-produtos, tentativa 1 falhou:', erro1.message)
      try {
        const produtos = await gerarComDeepSeek(chave, categoria, quantidade)
        return Response.json({ produtos: ajustarQuantidade(produtos, categoria, quantidade), fonte: 'deepseek-retry' })
      } catch (erro2) {
        console.error('gerar-produtos, tentativa 2 falhou:', erro2.message)
        return Response.json({ produtos: produtosFallback(categoria, quantidade), fonte: 'fallback' })
      }
    }
  },
}
