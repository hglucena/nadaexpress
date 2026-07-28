import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import reviewsOffline from '../src/data/fallback/reviews.js'
import { amostrarReviews } from '../src/lib/amostrarReviews.js'

const JANELA_MS = 60_000
const LIMITE_POR_JANELA = 15
const TIMEOUT_MS = 20_000
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

const ReviewGerada = z.object({
  nomeBase: z.string().min(1),
  nota: z.number().int().min(1).max(5),
  texto: z.string().min(1),
})

const RespostaGerada = z.object({ reviews: z.array(ReviewGerada).min(1) })

const SCHEMA_RESPOSTA = {
  type: 'object',
  properties: {
    reviews: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nomeBase: { type: 'string' },
          nota: { type: 'integer' },
          texto: { type: 'string' },
        },
        required: ['nomeBase', 'nota', 'texto'],
      },
    },
  },
  required: ['reviews'],
}

function promptSistema(titulo, categoria) {
  return `Você gera avaliações falsas de clientes pro NadaExpress, marketplace satírico onde nada é real — nenhum produto existe de verdade.

Gere exatamente 8 reviews pro produto "${titulo}" (categoria: ${categoria}), nessa mistura exata, nessa ordem:
1, 2, 3 — genéricas, elogiosas, 5 estrelas, texto curto e vago tipo "produto muito bom, recomendo, chegou rápido".
4, 5 — claramente sobre um produto DIFERENTE do anunciado, sem relação nenhuma com "${titulo}" (a pessoa avaliou a coisa errada).
6 — reclama especificamente do atraso do frete, nota 1 ou 2.
7 — em português com erro de tradução perceptível: concordância errada, palavra trocada, soa traduzido por máquina.
8 — nota 5, mas o texto é devastador e negativo — reclama muito do produto, mesmo assim deu 5 estrelas. A contradição é a piada, não corrija ela.

nomeBase: um apelido curto, minúsculo, sem espaço. Não precisa censurar, o sistema faz isso depois.

Responda só com o JSON do schema pedido. Sem markdown, sem crase, sem texto antes ou depois, sem comentário.`
}

function reviewsFallback(titulo) {
  // mesma amostragem balanceada do modo offline do cliente, chaveada pelo título
  return amostrarReviews(reviewsOffline, titulo)
}

function comTimeout(promessa, ms) {
  return Promise.race([
    promessa,
    new Promise((_, rejeitar) => setTimeout(() => rejeitar(new Error('timeout')), ms)),
  ])
}

async function gerarComGemini(ai, titulo, categoria) {
  const resposta = await comTimeout(
    ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Gere as 8 reviews pro produto "${titulo}".`,
      config: {
        systemInstruction: promptSistema(titulo, categoria),
        responseMimeType: 'application/json',
        responseSchema: SCHEMA_RESPOSTA,
      },
    }),
    TIMEOUT_MS
  )

  const dados = JSON.parse(resposta.text)
  const validado = RespostaGerada.parse(dados)

  return validado.reviews.map((review, indice) => ({
    id: `gerado-${Date.now()}-${indice}`,
    nome: censurarNome(review.nomeBase),
    nota: review.nota,
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

    const chave = process.env.GEMINI_API_KEY
    if (!chave) {
      return Response.json({ reviews: reviewsFallback(titulo), fonte: 'fallback-sem-chave' })
    }

    const ai = new GoogleGenAI({ apiKey: chave })

    try {
      const reviews = await gerarComGemini(ai, titulo, categoria)
      return Response.json({ reviews, fonte: 'gemini' })
    } catch {
      try {
        const reviews = await gerarComGemini(ai, titulo, categoria)
        return Response.json({ reviews, fonte: 'gemini-retry' })
      } catch {
        return Response.json({ reviews: reviewsFallback(titulo), fonte: 'fallback' })
      }
    }
  },
}
