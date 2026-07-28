import { criarRng, hashDeString, sortearItem, embaralhar } from './aleatorio.js'

// Mistura fixa de arquétipos por produto — a mesma receita do gerador online:
// maioria genérica, avaliação de outro produto, frete atrasado, tradução ruim,
// e a nota 5 com texto devastador.
const RECEITA = [
  'generica5', 'generica5', 'generica5',
  'produtoErrado',
  'freteAtrasado',
  'traducaoRuim',
  'cincoDevastador',
  'detalheEstranho',
]
const CORINGAS = ['tamanhoErrado', 'detalheEstranho', 'produtoErrado', 'generica5']

// Amostra determinística: a mesma chave (id do produto) devolve sempre as
// mesmas reviews, imitando o cache por produto do modo online.
export function amostrarReviews(poolCompleto, chave) {
  const rng = criarRng(hashDeString(String(chave)))

  const porTipo = {}
  for (const review of poolCompleto) {
    ;(porTipo[review.tipo] ??= []).push(review)
  }

  const escolhidas = []
  const textosUsados = new Set()

  for (const tipo of [...RECEITA, sortearItem(rng, CORINGAS)]) {
    // dedup por texto-base: o pool tem o mesmo texto repetido com mutações leves
    const candidatas = (porTipo[tipo] ?? []).filter(
      (review) => !textosUsados.has(review.texto.slice(0, 30).toLowerCase())
    )
    if (candidatas.length === 0) continue
    const escolhida = sortearItem(rng, candidatas)
    textosUsados.add(escolhida.texto.slice(0, 30).toLowerCase())
    escolhidas.push(escolhida)
  }

  return embaralhar(rng, escolhidas).map((review, indice) => ({
    id: `${chave}-r${indice}`,
    nome: review.nome,
    nota: review.nota,
    data: review.data,
    texto: review.texto,
  }))
}
