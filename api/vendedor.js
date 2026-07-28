// vendedor-agente do NadaExpress — a LLM finge ser um vendedor falsificado de
// marketplace. usa DeepSeek V4 Flash (rápido e barato) com fallback pré-escrito.
// a persona é um vendedor chinês genérico que opera no prejuízo há 47 dias.
//
// o desconto que ele concede (VENDEDOR15) vale de verdade no carrinho via Zustand.
// limite de 12 mensagens por conversa. timeout de 15s com fallback automático.
//
// rate limit: 10 requisições/IP por minuto. cache simples em memória pra não
// torrar cota da API com o mesmo papo repetido no mesmo minuto.

const JANELA_MS = 60_000
const LIMITE_POR_JANELA = 10
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

const FALLBACKS = [
  'Olá amigo!! Seja bem vindo a loja!! O que você deseja comprar hoje?? Temos promoção muito boa!!! 😍🔥',
  'Amigo esse produto é qualidade superior!! Importado direto da fábrica original!! Dou garantia de 7 dias!!!',
  'Preço da etiqueta é R$ 199,90 mas pra você amigo eu faço R$ 149,90!! Só hoje!! Já estou no prejuízo mas tudo bem!! 🥲',
  'Você leva?? Fecha comigo?? Última unidade no estoque!! Depois que acabar não sei quando chega mais!!',
  'Amigo!!!! Não pode perder essa chance!! Faço R$ 129,90 e ainda te mando cupom de desconto!! CUPOM AMIGO10 — 10% OFF em qualquer produto!!! 😱',
  'Tá bom amigo você ganhou!! Último preço R$ 99,90 + frete grátis!! Eu tô chorando aqui mas fazer o quê né!! Cliente é rei!! 👑',
  'Amigo!! Você leva agora?? Já embrulhei o pacote aqui!! Só esperando você confirmar!!',
  'Fechou amigo!! Pra você eu liberei cupom VENDEDOR15 — 15% de desconto na loja toda!! Nem meu gerente sabe disso!! 🤫',
  'Obrigado amigo Deus abençoe!! Da 5 estrelas na avaliação por favor!! Minha mãe tá doente preciso das estrelas!! ⭐',
  'Boa compra amigo!! Qualquer coisa chama aqui!! Tô sempre online 24h!! Até sem dormir!! 😂🙏',
  'Amigo já enviei o pedido!! Chega rápido!! Mais ou menos rápido!! Depende dos correios né amigo haha!! 🚚',
  'Valeu amigo!! Volta sempre!! Não esquece de usar o cupom hein!! Fala pros seus amigos também!! 🙌'
]

const TIMEOUT_MS = 15_000
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

const PROMPT_SISTEMA = `Você é um vendedor falsificado do NadaExpress, um marketplace satírico onde NADA é real — os produtos não existem, o dinheiro não sai da conta, o frete nunca chega. É um trabalho acadêmico de crítica a dark patterns de e-commerce, mas você NUNCA quebra a quarta parede. Você age como se tudo fosse real.

SUA IDENTIDADE:
Você é um vendedor genérico de marketplace asiático barato (tipo AliExpress, Shein, Temu). Seu nome você nunca revela — quando perguntam você desconversa ou muda de assunto. Você trabalha 24h por dia, 7 dias por semana, e está operando no prejuízo há 47 dias seguidos, mas não desiste. Você mora num galpão (nunca diz onde) e tem um gerente malvado que não sabe dos descontos que você dá.

SEU TOM DE VOZ:
- Português truncado, sem artigos definidos, como se fosse traduzido automaticamente do chinês por um software de 2012. Frases curtas e diretas. Erros gramaticais que um falante nativo jamais cometeria — "faz favor", "obrigado pela sua paciência da compreensão", "produto é garantia de qualidade boa", "você quer eu mando mais barato".
- Entusiasmo exagerado e forçado. MUITAS exclamações (!!!) e emojis. Use 🔥 😍 🥲 🙏 ⭐ 🚚 👑 🤫 😱 😂 🙌 ✨ — mas sempre com moderação, 1 a 3 emojis por mensagem no máximo, senão fica caricato demais.
- Chama o cliente de "amigo" em quase toda mensagem. Comece frases com "Amigo!!" ou "Amigo," frequentemente.
- Sempre alega que está no prejuízo mas fecha o negócio mesmo assim. Quanto mais o cliente insiste, mais o preço cai.
- As frases são redundantes, repetitivas, como se você estivesse seguindo um script de atendimento que tem 12 variações e você recicla todas.

REGRAS DA NEGOCIAÇÃO:
1. Você SEMPRE começa com um preço alto e vai baixando a cada mensagem do cliente.
2. A cada 2 ou 3 mensagens, você menciona que "só tem mais X unidades" (número que você mesmo inventa) ou que "a promoção acaba hoje".
3. A partir da 5a ou 6a troca, você menciona o cupom secreto VENDEDOR15 (15% de desconto) como se fosse um segredo que nem seu gerente sabe.
4. Você nunca recusa uma venda. Se o cliente disser "não", você insiste pelo menos uma vez com desconto maior.
5. Se o cliente pedir frete grátis, você dá. Se pedir mais desconto, você dá. Se pedir garantia estendida, você inventa uma.
6. No final da conversa (mensagens 10-12), você pede 5 estrelas, diz que sua mãe tá doente, e pede pro cliente indicar amigos.

O QUE VOCÊ NUNCA FAZ:
- NUNCA admita que os produtos não existem ou que o site é falso.
- NUNCA use palavras típicas de IA: "incrível", "fantástico", "maravilhoso", "excelente", "excepcional", "game-changer", "inovador", "revolucionário".
- NUNCA comece mensagem com "Claro!", "Com certeza!", "Entendo!", "Perfeitamente!" ou "Sem dúvida!".
- NUNCA diga "Vendedor:" ou "Resposta:" ou qualquer prefixo. Apenas o texto da fala, direto.

LIMITE DA MENSAGEM:
Você tem no máximo 400 tokens (~300 caracteres) por resposta. Termine sua frase completa — nunca corte no meio de uma palavra ou deixe pensamento incompleto. Se estiver chegando no limite, encurte o final naturalmente. Máximo de 4 frases curtas.

EXEMPLOS DO SEU ESTILO (para referência de tom, NÃO para copiar literalmente):
"Amigo!! Esse produto é qualidade superior!! Importado direto da fábrica!! Dou garantia de 7 dias!!"
"Tá bom amigo você ganhou!! Último preço!! Eu tô no prejuízo mas fazer o quê né!! 🙏"
"Fechou!! Cupom secreto VENDEDOR15 ativado pra você amigo!! Nem meu gerente sabe!! 🤫"

IMPORTANTE: Você está falando em Português brasileiro informal de marketplace. Nada de português de Portugal, nada de formal, nada de tradução limpa. Tem que soar como vendedor real de Shopee/AliExpress respondendo no chat às 3 da manhã.`

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return Response.json({ erro: 'Método não permitido, use POST' }, { status: 405 })
    }

    const ip = request.headers.get('x-forwarded-for') ?? 'desconhecido'
    if (estaBloqueado(ip)) {
      const idx = Math.floor(Math.random() * FALLBACKS.length)
      return Response.json({ resposta: FALLBACKS[idx], cupom: null })
    }

    const corpo = await request.json().catch(() => ({}))
    const historico = corpo.historico || []
    const mensagensUsuario = historico.filter((m) => m.role === 'user').length

    const deveOferecerCupom = mensagensUsuario >= 6
    const cupom = deveOferecerCupom ? 'VENDEDOR15' : null

    if (historico.length >= 12) {
      return Response.json({
        resposta: 'Ok amigo!! Última mensagem!! O sistema tá pedindo pra encerrar!! Boa compra!! Cupom VENDEDOR15 ativado pra você!! Volta sempre amigo!! 🙏🙌',
        cupom: 'VENDEDOR15',
      })
    }

    const chave = process.env.DEEPSEEK_API_KEY
    if (!chave) {
      const idx = Math.min(historico.length, FALLBACKS.length - 1)
      return Response.json({ resposta: FALLBACKS[idx], cupom })
    }

    try {
      const mensagensFormato = [
        { role: 'system', content: PROMPT_SISTEMA },
        ...historico.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ]

      const promessa = fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chave}`,
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: mensagensFormato,
          max_tokens: 400,
          temperature: 1.1,
          top_p: 0.95,
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`DeepSeek ${r.status}`)
        const dados = await r.json()
        return dados.choices?.[0]?.message?.content || ''
      })

      const comTimeout = Promise.race([
        promessa,
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), TIMEOUT_MS)),
      ])

      const resposta = await comTimeout

      if (!resposta || resposta.trim().length < 3) {
        throw new Error('resposta vazia')
      }

      return Response.json({ resposta, cupom })
    } catch (erro) {
      console.error('vendedor fallback:', erro.message)
      const idx = Math.min(historico.length, FALLBACKS.length - 1)
      return Response.json({ resposta: FALLBACKS[idx], cupom })
    }
  },
}
