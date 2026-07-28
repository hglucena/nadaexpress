import http from 'node:http'
import path from 'node:path'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// substituto leve de `vercel dev` pro dia a dia — a Vercel exige login interativo
// que não dá pra automatizar aqui. Isso só roda local; o deploy usa a Vercel de verdade.

const RAIZ = path.resolve(import.meta.dirname, '..')
const PORTA = 3001

function carregarEnv(caminho) {
  if (!existsSync(caminho)) return
  for (const linha of readFileSync(caminho, 'utf-8').split('\n')) {
    const limpa = linha.trim()
    if (!limpa || limpa.startsWith('#')) continue
    const igual = limpa.indexOf('=')
    if (igual === -1) continue
    const chave = limpa.slice(0, igual).trim()
    const valor = limpa.slice(igual + 1).trim()
    if (!(chave in process.env)) process.env[chave] = valor
  }
}

carregarEnv(path.join(RAIZ, '.env'))

const apiDir = path.join(RAIZ, 'api')
const rotas = new Map()

for (const arquivo of readdirSync(apiDir)) {
  if (!arquivo.endsWith('.js')) continue
  const nome = arquivo.replace(/\.js$/, '')
  const modulo = await import(pathToFileURL(path.join(apiDir, arquivo)).href)
  rotas.set(`/api/${nome}`, modulo.default)
  console.log(`rota local: /api/${nome}`)
}

const servidor = http.createServer(async (req, res) => {
  const handler = rotas.get(req.url.split('?')[0])
  if (!handler) {
    res.writeHead(404)
    res.end(JSON.stringify({ erro: 'rota não encontrada' }))
    return
  }

  const partes = []
  for await (const parte of req) partes.push(parte)
  const corpo = partes.length > 0 ? Buffer.concat(partes) : undefined

  const cabecalhos = new Headers()
  for (const [chave, valor] of Object.entries(req.headers)) {
    if (valor) cabecalhos.set(chave, Array.isArray(valor) ? valor.join(', ') : valor)
  }
  if (!cabecalhos.has('x-forwarded-for')) {
    cabecalhos.set('x-forwarded-for', req.socket.remoteAddress ?? '127.0.0.1')
  }

  try {
    const requisicaoWeb = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: cabecalhos,
      body: corpo,
    })
    const respostaWeb = await handler.fetch(requisicaoWeb)
    res.writeHead(respostaWeb.status, Object.fromEntries(respostaWeb.headers))
    res.end(Buffer.from(await respostaWeb.arrayBuffer()))
  } catch (erro) {
    console.error(`erro em ${req.url}:`, erro)
    res.writeHead(500)
    res.end(JSON.stringify({ erro: 'erro interno' }))
  }
})

servidor.listen(PORTA, () => console.log(`api local em http://localhost:${PORTA}`))
