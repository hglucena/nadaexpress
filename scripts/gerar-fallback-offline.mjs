// Expande as sementes de fallback-seeds/ pro dataset offline final e grava em
// src/data/fallback/. Determinístico: rodar de novo produz o mesmo resultado.
//
//   node scripts/gerar-fallback-offline.mjs
//
// Os arquivos gerados são módulos JS (não .json) de propósito: import de JSON
// exige `with { type: 'json' }` no Node e suporte do bundler da Vercel — módulo
// JS funciona igual em Vite, Node local e Vercel sem atributo nenhum.

import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { sementesA } from './fallback-seeds/produtos-a.mjs'
import { sementesB } from './fallback-seeds/produtos-b.mjs'
import { sementesReviews } from './fallback-seeds/reviews.mjs'
import { criarRng, sortearItem, sortearInteiro, embaralhar } from '../src/lib/aleatorio.js'

const TOTAL_PRODUTOS = 120
const TOTAL_REVIEWS = 400
const CATEGORIAS = ['Eletrônicos', 'Casa', 'Cozinha', 'Pet', 'Beleza', 'Ferramentas', 'Moda', 'Brinquedos', 'Fitness']

const rng = criarRng(20260728)

// ─── produtos: 64 sementes + variantes "outro vendedor" do mesmo item ───

const PREFIXOS_VARIANTE = ['Original ', 'Novo ', 'Promoção ', 'Oferta Relâmpago ', '2024 ', 'Top ']
const SUFIXOS_VARIANTE = [' Envio Rápido', ' Frete Grátis Brasil', ' Pronta Entrega', ' Qualidade Premium', ' Loja Oficial', ' Atacado Varejo']

function variarPreco(preco, fator) {
  return Math.max(9.9, Math.round(preco * fator * 100) / 100)
}

function criarVariante(semente) {
  const fator = 0.8 + rng() * 0.4
  const preco = variarPreco(semente.preco, fator)
  const precoOriginal = variarPreco(semente.precoOriginal, fator * (0.95 + rng() * 0.15))
  const nota = Math.min(4.9, Math.max(3.0, Math.round((semente.nota + (rng() - 0.5) * 0.8) * 10) / 10))
  return {
    ...semente,
    titulo: sortearItem(rng, PREFIXOS_VARIANTE) + semente.titulo + sortearItem(rng, SUFIXOS_VARIANTE),
    preco: Math.min(preco, precoOriginal * 0.95),
    precoOriginal,
    vendidos: sortearInteiro(rng, 10, 20000),
    nota,
  }
}

const sementes = [...sementesA, ...sementesB]
const variantes = sementes.slice(0, TOTAL_PRODUTOS - sementes.length).map(criarVariante)

const produtos = embaralhar(rng, [...sementes, ...variantes]).map((produto, indice) => {
  const preco = Math.round(produto.preco * 100) / 100
  const precoOriginal = Math.round(produto.precoOriginal * 100) / 100
  return {
    id: `off-${indice + 1}`,
    ...produto,
    preco,
    precoOriginal,
    desconto: Math.max(1, Math.round((1 - preco / precoOriginal) * 100)),
  }
})

// ─── reviews: 110 sementes → 400 com nome, data, nota e mutações de texto ───

const NOMES = [
  'rafael', 'maria', 'joao', 'ana', 'pedro', 'julia', 'lucas', 'carla', 'bruno', 'fernanda',
  'gustavo', 'patricia', 'thiago', 'amanda', 'felipe', 'beatriz', 'rodrigo', 'camila', 'marcos', 'leticia',
  'andre', 'vanessa', 'diego', 'larissa', 'eduardo', 'sabrina', 'vitor', 'tatiane', 'leandro', 'priscila',
  'henrique', 'daniela', 'fabio', 'renata', 'caue', 'michele', 'wesley', 'aline', 'otavio', 'simone',
  'igor', 'natalia', 'sergio', 'claudia', 'mateus', 'rosana', 'danilo', 'elaine',
]

const DATAS = [
  'hoje', 'ontem', 'há 2 dias', 'há 3 dias', 'há 4 dias', 'há 5 dias', 'há 6 dias',
  'há 1 semana', 'há 2 semanas', 'há 3 semanas', 'há 1 mês', 'há 2 meses', 'há 3 meses',
]

const SUFIXOS_TEXTO = ['', '', '', '', '!!', '!!!', ' 👍', ' ⭐⭐⭐⭐⭐']

const NOTA_POR_TIPO = {
  generica5: () => 5,
  produtoErrado: () => sortearInteiro(rng, 4, 5),
  freteAtrasado: () => sortearInteiro(rng, 1, 2),
  traducaoRuim: () => sortearInteiro(rng, 3, 5),
  cincoDevastador: () => 5,
  detalheEstranho: () => sortearInteiro(rng, 3, 5),
  tamanhoErrado: () => sortearInteiro(rng, 2, 4),
}

function censurarNome(nome) {
  return `${nome[0]}***${nome[nome.length - 1]}`
}

function removerAcentos(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function mutarTexto(texto) {
  let resultado = texto + sortearItem(rng, SUFIXOS_TEXTO)
  const sorte = rng()
  if (sorte < 0.12) resultado = resultado.toUpperCase()
  else if (sorte < 0.3) resultado = removerAcentos(resultado)
  return resultado
}

const reviews = Array.from({ length: TOTAL_REVIEWS }, (_, indice) => {
  const semente = sementesReviews[indice % sementesReviews.length]
  return {
    id: `rev-${indice + 1}`,
    tipo: semente.tipo,
    nome: censurarNome(sortearItem(rng, NOMES)),
    nota: NOTA_POR_TIPO[semente.tipo](),
    data: sortearItem(rng, DATAS),
    texto: mutarTexto(semente.texto),
  }
})

// ─── validação antes de gravar ───

const erros = []

if (produtos.length !== TOTAL_PRODUTOS) erros.push(`esperava ${TOTAL_PRODUTOS} produtos, saíram ${produtos.length}`)
if (new Set(produtos.map((p) => p.id)).size !== produtos.length) erros.push('id de produto duplicado')
for (const p of produtos) {
  if (!(p.preco < p.precoOriginal)) erros.push(`${p.id}: preco ${p.preco} >= precoOriginal ${p.precoOriginal}`)
  if (!CATEGORIAS.includes(p.categoria)) erros.push(`${p.id}: categoria desconhecida "${p.categoria}"`)
  if (p.nota < 3.0 || p.nota > 5.0) erros.push(`${p.id}: nota fora da faixa (${p.nota})`)
  if (!p.titulo || !p.descricao || Object.keys(p.specs).length === 0) erros.push(`${p.id}: campo vazio`)
}

if (reviews.length !== TOTAL_REVIEWS) erros.push(`esperava ${TOTAL_REVIEWS} reviews, saíram ${reviews.length}`)
if (new Set(reviews.map((r) => r.id)).size !== reviews.length) erros.push('id de review duplicado')
for (const r of reviews) {
  if (!/^.\*\*\*.$/.test(r.nome)) erros.push(`${r.id}: nome não censurado (${r.nome})`)
  if (r.nota < 1 || r.nota > 5) erros.push(`${r.id}: nota inválida (${r.nota})`)
  if (!r.texto) erros.push(`${r.id}: texto vazio`)
}

if (erros.length > 0) {
  console.error('validação falhou:')
  for (const erro of erros) console.error(`  - ${erro}`)
  process.exit(1)
}

// ─── gravação ───

const destino = path.resolve(import.meta.dirname, '../src/data/fallback')
mkdirSync(destino, { recursive: true })

const cabecalho = '// Gerado por scripts/gerar-fallback-offline.mjs — não editar à mão.\n'
writeFileSync(path.join(destino, 'produtos.js'), `${cabecalho}export default ${JSON.stringify(produtos, null, 2)}\n`)
writeFileSync(path.join(destino, 'reviews.js'), `${cabecalho}export default ${JSON.stringify(reviews, null, 2)}\n`)

const porCategoria = {}
for (const p of produtos) porCategoria[p.categoria] = (porCategoria[p.categoria] ?? 0) + 1
const porTipo = {}
for (const r of reviews) porTipo[r.tipo] = (porTipo[r.tipo] ?? 0) + 1

console.log(`ok: ${produtos.length} produtos gravados`, porCategoria)
console.log(`ok: ${reviews.length} reviews gravadas`, porTipo)
