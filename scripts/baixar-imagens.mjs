// baixa todas as imagens dos produtos do Pollinations.ai e salva em public/imagens/.
// roda uma vez só: node scripts/baixar-imagens.mjs
// depois o site serve as imagens locais sem bater na API.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(__dirname, '..')
const SAIDA = resolve(RAIZ, 'public', 'imagens')

// import dinâmico do mock-produtos (ESM)
const { produtosMock } = await import('../src/data/mock-produtos.js')

if (!existsSync(SAIDA)) mkdirSync(SAIDA, { recursive: true })

const BASE = 'https://image.pollinations.ai/prompt'

function url(id, termo, indice) {
  const prompt = encodeURIComponent(`${termo}, product photo, studio lighting, white background`)
  return `${BASE}/${prompt}?seed=${id}-${indice}&width=400&height=400&nologo=true`
}

async function baixar(url, caminho) {
  if (existsSync(caminho)) {
    console.log(`  pulando (já existe): ${caminho}`)
    return
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(caminho, buffer)
  console.log(`  ok: ${caminho}`)
}

let total = 0
for (const p of produtosMock) {
  const termo = p.termoBusca || p.categoria
  console.log(`\n📦 ${p.id} — ${termo}`)
  for (let i = 0; i < 1; i++) {
    const nome = `${p.id}.png`
    const caminho = resolve(SAIDA, nome)
    try {
      await baixar(url(p.id, termo, i), caminho)
      total++
    } catch (erro) {
      console.log(`  FALHA: ${erro.message}`)
    }
  }
}

console.log(`\n✅ Baixadas: ${total} imagens em ${SAIDA}`)
