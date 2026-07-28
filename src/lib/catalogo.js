import { produtosMock } from '../data/mock-produtos'
import produtosOffline from '../data/fallback/produtos'

const CHAVE_EXTRAS = 'nadaexpress-produtos-gerados'

// specs pode chegar como array de {chave, valor} (formato que o schema do
// Gemini aceita) — o app trabalha sempre com objeto simples
export function normalizarSpecs(produto) {
  if (!produto || !Array.isArray(produto.specs)) return produto
  return {
    ...produto,
    specs: Object.fromEntries(produto.specs.map((item) => [item.chave, item.valor])),
  }
}

export function encontrarProduto(id) {
  if (!id) return null

  const numerico = Number(id)
  if (Number.isInteger(numerico)) {
    return produtosMock.find((produto) => produto.id === numerico) ?? null
  }

  // repetições do dataset offline ganham sufixo #n pra manter a key única
  const idBase = id.split('#')[0]
  const doOffline = produtosOffline.find((produto) => produto.id === idBase)
  if (doOffline) return doOffline

  try {
    const extras = JSON.parse(sessionStorage.getItem(CHAVE_EXTRAS) ?? '[]')
    const daSessao = extras.find((produto) => produto.id === id)
    if (daSessao) return normalizarSpecs(daSessao)
  } catch {
    // cache da sessão ilegível — trata como não encontrado
  }

  return null
}
