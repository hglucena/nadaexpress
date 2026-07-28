// baixa todas as imagens dos produtos do Pollinations.ai e salva em public/imagens/.
// roda uma vez só: node scripts/baixar-imagens.mjs
// depois o site serve as imagens locais sem bater na API.
// usa 4 downloads paralelos para acelerar.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(__dirname, '..')
const SAIDA = resolve(RAIZ, 'public', 'imagens')
const PARALELOS = 1

const { produtosMock } = await import('../src/data/mock-produtos.js')

if (!existsSync(SAIDA)) mkdirSync(SAIDA, { recursive: true })

const BASE = 'https://image.pollinations.ai/prompt'

function url(id, termo) {
  const prompt = encodeURIComponent(`${termo}, product photo, studio lighting, white background`)
  return `${BASE}/${prompt}?seed=${id}&width=400&height=400&nologo=true`
}

async function baixarUma(id, termo) {
  const caminho = resolve(SAIDA, `${id}.png`)
  if (existsSync(caminho)) {
    process.stdout.write('.')
    return 'pulou'
  }
  const res = await fetch(url(id, termo))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(caminho, buffer)
  process.stdout.write('✓')
  return 'ok'
}

async function baixarEmLotes(tarefas, limite) {
  let ok = 0
  let pulou = 0
  let falhas = 0
  const fila = [...tarefas]

  async function trabalhador() {
    while (fila.length > 0) {
      const { id, termo } = fila.shift()
      try {
        const resultado = await baixarUma(id, termo)
        if (resultado === 'ok') ok++
        else pulou++
        // pausa entre requisições pra não tomar rate limit
        await new Promise(r => setTimeout(r, 1500))
      } catch (erro) {
        process.stdout.write('✗')
        falhas++
      }
    }
  }

  console.log(`Baixando ${tarefas.length} imagens (${limite} em paralelo)...\n`)
  await Promise.all(Array.from({ length: limite }, () => trabalhador()))
  console.log(`\n\n✅ ok=${ok}  pulados=${pulou}  falhas=${falhas}  total=${tarefas.length}`)
}

const tarefas = []
for (const p of produtosMock) {
  const termo = p.termoBusca || p.categoria
  tarefas.push({ id: p.id, termo })
}

await baixarEmLotes(tarefas, PARALELOS)
