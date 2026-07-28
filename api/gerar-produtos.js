import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import produtosOffline from '../src/data/fallback/produtos.js'

const JANELA_MS = 60_000
const LIMITE_POR_JANELA = 10
const TIMEOUT_MS = 20_000
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

const ProdutoGerado = z.object({
  titulo: z.string().min(1),
  preco: z.number().positive(),
  precoOriginal: z.number().positive(),
  nota: z.number().min(0).max(5),
  vendidos: z.number().int().min(0),
  categoria: z.string().min(1),
  descricao: z.string().min(1),
  specs: z.array(z.object({ chave: z.string(), valor: z.string() })),
})

const RespostaGerada = z.object({ produtos: z.array(ProdutoGerado) })

function criarSchemaResposta(quantidade) {
  return {
    type: 'object',
    properties: {
      produtos: {
        type: 'array',
        minItems: quantidade,
        maxItems: quantidade,
        items: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            preco: { type: 'number' },
            precoOriginal: { type: 'number' },
            nota: { type: 'number' },
            vendidos: { type: 'integer' },
            categoria: { type: 'string' },
            descricao: { type: 'string' },
            specs: {
              type: 'array',
              items: {
                type: 'object',
                properties: { chave: { type: 'string' }, valor: { type: 'string' } },
                required: ['chave', 'valor'],
              },
            },
          },
          required: ['titulo', 'preco', 'precoOriginal', 'nota', 'vendidos', 'categoria', 'descricao', 'specs'],
        },
      },
    },
    required: ['produtos'],
  }
}

const PROMPT_SISTEMA = `Você gera produtos falsos pro NadaExpress, um marketplace satírico onde nada é real — nenhum produto existe de verdade, é uma crítica a dark patterns de e-commerce.

Gere produtos no estilo de anúncio barato traduzido automaticamente, mal revisado:
- Título: 15 a 25 palavras, cheio de palavras-chave empilhadas sem conectivo natural, parece traduzido automaticamente. Maiúscula na maioria das palavras.
- Descrição: 1 ou 2 frases que contradizem alguma informação do título, ou trazem uma ressalva estranha e deslocada.
- Specs: pelo menos um item com unidade trocada ou fisicamente impossível (peso em metros, voltagem em litros, capacidade em Bluetooth — esse tipo de erro).
- nota entre 3.0 e 5.0, vendidos entre 10 e 20000.
- preco sempre menor que precoOriginal.
- categoria: repete a categoria pedida.

Responda só com o JSON do schema pedido. Sem markdown, sem crase, sem texto antes ou depois, sem comentário.`

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

function comTimeout(promessa, ms) {
  return Promise.race([
    promessa,
    new Promise((_, rejeitar) => setTimeout(() => rejeitar(new Error('timeout')), ms)),
  ])
}

async function gerarComGemini(ai, categoria, quantidade) {
  const resposta = await comTimeout(
    ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Gere ${quantidade} produtos da categoria "${categoria}".`,
      config: {
        systemInstruction: PROMPT_SISTEMA,
        responseMimeType: 'application/json',
        responseSchema: criarSchemaResposta(quantidade),
      },
    }),
    TIMEOUT_MS
  )

  const dados = JSON.parse(resposta.text)
  const validado = RespostaGerada.parse(dados)

  return validado.produtos.map((produto, indice) => {
    const precoOriginal = Math.round(produto.precoOriginal * 100) / 100
    const preco = Math.round(Math.min(produto.preco, precoOriginal * 0.99) * 100) / 100
    const desconto = Math.max(1, Math.round((1 - preco / precoOriginal) * 100))
    // o schema do Gemini exige specs como array de {chave, valor}; o app usa objeto
    const specs = Object.fromEntries(produto.specs.map((item) => [item.chave, item.valor]))
    return { id: `gerado-${Date.now()}-${indice}`, ...produto, specs, preco, precoOriginal, desconto }
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

    const chave = process.env.GEMINI_API_KEY
    if (!chave) {
      return Response.json({ produtos: produtosFallback(categoria, quantidade), fonte: 'fallback-sem-chave' })
    }

    const ai = new GoogleGenAI({ apiKey: chave })

    try {
      const produtos = await gerarComGemini(ai, categoria, quantidade)
      return Response.json({ produtos, fonte: 'gemini' })
    } catch (erro1) {
      console.error('gerar-produtos, tentativa 1 falhou:', erro1.message)
      try {
        const produtos = await gerarComGemini(ai, categoria, quantidade)
        return Response.json({ produtos, fonte: 'gemini-retry' })
      } catch (erro2) {
        console.error('gerar-produtos, tentativa 2 falhou:', erro2.message)
        return Response.json({ produtos: produtosFallback(categoria, quantidade), fonte: 'fallback' })
      }
    }
  },
}
