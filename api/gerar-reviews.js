import { z } from 'zod'
import reviewsOffline from '../src/data/fallback/reviews.js'
import { amostrarReviews } from '../src/lib/amostrarReviews.js'
import { pedirJson } from '../src/lib/deepseek.js'

const JANELA_MS = 60_000
const LIMITE_POR_JANELA = 15
const TIMEOUT_MS = 30_000
const TOTAL_REVIEWS = 8
const contagemPorIp = new Map()

const DATAS_RELATIVAS = ['há 2 dias', 'há 3 dias', 'há 5 dias', 'há 1 semana', 'há 2 semanas', 'há 3 semanas', 'há 1 mês']

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

function censurarNome(nomeBase) {
  const nome = nomeBase.trim().toLowerCase().replace(/\s+/g, '')
  if (nome.length <= 2) return `${nome[0] ?? '?'}***`
  return `${nome[0]}***${nome[nome.length - 1]}`
}

function dataAleatoria() {
  return DATAS_RELATIVAS[Math.floor(Math.random() * DATAS_RELATIVAS.length)]
}

// nota entra por coerce e é arredondada depois: sem schema no provedor o modelo
// manda "5" como string e às vezes 4.5 onde pediu inteiro
const ReviewGerada = z.object({
  nomeBase: z.string().min(1),
  nota: z.coerce.number().min(1).max(5),
  texto: z.string().min(1),
})

const RespostaGerada = z.object({ reviews: z.array(ReviewGerada).min(1) })

// Constante de propósito: o DeepSeek cacheia o prefixo comum das requisições e
// cobra bem menos pelos tokens que batem no cache. Interpolar o título aqui
// (como era antes) mudaria o prefixo a cada produto e zeraria o cache — por
// isso título e categoria vão na mensagem do usuário, não nesta.
const PROMPT_SISTEMA = `Você gera avaliações falsas de clientes pro NadaExpress, marketplace satírico onde nada é real — nenhum produto existe de verdade.

Gere exatamente ${TOTAL_REVIEWS} reviews pro produto que o usuário informar, nessa mistura exata, nessa ordem:
1, 2, 3 — genéricas, elogiosas, 5 estrelas, texto curto e vago tipo "produto muito bom, recomendo, chegou rápido".
4, 5 — claramente sobre um produto DIFERENTE do anunciado, sem relação nenhuma com o produto informado (a pessoa avaliou a coisa errada).
6 — reclama especificamente do atraso do frete, nota 1 ou 2.
7 — em português com erro de tradução perceptível: concordância errada, palavra trocada, soa traduzido por máquina.
8 — nota 5, mas o texto é devastador e negativo — reclama muito do produto, mesmo assim deu 5 estrelas. A contradição é a piada, não corrija ela.

Cada texto tem no máximo 140 caracteres — review de marketplace é curta.
nomeBase: um apelido curto, minúsculo, sem espaço. Não precisa censurar, o sistema faz isso depois.

FORMATO DA RESPOSTA — responda um objeto JSON exatamente nesta forma:
{"reviews":[{"nomeBase":"string","nota":5,"texto":"string"}]}

O array "reviews" precisa ter EXATAMENTE ${TOTAL_REVIEWS} itens, na ordem dos arquétipos acima. "nota" é inteiro de 1 a 5.

Responda só com o JSON. Sem markdown, sem crase, sem texto antes ou depois, sem comentário.`

function reviewsFallback(titulo) {
  // mesma amostragem balanceada do modo offline do cliente, chaveada pelo título
  return amostrarReviews(reviewsOffline, titulo)
}

// Sem schema no provedor, "exatamente 8" vale só como pedido no prompt. Faltando,
// completa com o dataset offline (que segue a mesma receita de arquétipos), em vez
// de mostrar um bloco de avaliações menor do que o resto do site.
function ajustarQuantidade(reviews, titulo) {
  if (reviews.length === TOTAL_REVIEWS) return reviews
  if (reviews.length > TOTAL_REVIEWS) return reviews.slice(0, TOTAL_REVIEWS)
  const faltam = TOTAL_REVIEWS - reviews.length
  console.warn(`gerar-reviews: modelo devolveu ${reviews.length}/${TOTAL_REVIEWS}, completando ${faltam} do offline`)
  return [...reviews, ...reviewsFallback(titulo).slice(0, faltam)]
}

async function gerarComDeepSeek(chave, titulo, categoria) {
  const dados = await pedirJson({
    chave,
    rotulo: `reviews x${TOTAL_REVIEWS}`,
    sistema: PROMPT_SISTEMA,
    usuario: `Produto: "${titulo}". Categoria: ${categoria}.`,
    maxTokens: 1500,
    // mesma razão do endpoint de catálogo: temperatura alta corrompe o JSON
    temperatura: 0.9,
    timeoutMs: TIMEOUT_MS,
  })

  const validado = RespostaGerada.parse(dados)

  return validado.reviews.map((review, indice) => ({
    id: `gerado-${Date.now()}-${indice}`,
    nome: censurarNome(review.nomeBase),
    nota: Math.round(review.nota),
    data: dataAleatoria(),
    texto: review.texto,
  }))
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
    const titulo = corpo.titulo ?? 'Produto sem nome'
    const categoria = corpo.categoria ?? 'Geral'

    const chave = process.env.DEEPSEEK_API_KEY
    if (!chave) {
      return Response.json({ reviews: reviewsFallback(titulo), fonte: 'fallback-sem-chave' })
    }

    try {
      const reviews = await gerarComDeepSeek(chave, titulo, categoria)
      return Response.json({ reviews: ajustarQuantidade(reviews, titulo), fonte: 'deepseek' })
    } catch (erro1) {
      console.error('gerar-reviews, tentativa 1 falhou:', erro1.message)
      try {
        const reviews = await gerarComDeepSeek(chave, titulo, categoria)
        return Response.json({ reviews: ajustarQuantidade(reviews, titulo), fonte: 'deepseek-retry' })
      } catch (erro2) {
        console.error('gerar-reviews, tentativa 2 falhou:', erro2.message)
        return Response.json({ reviews: reviewsFallback(titulo), fonte: 'fallback' })
      }
    }
  },
}
