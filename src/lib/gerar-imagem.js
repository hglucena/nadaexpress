// imagens dos produtos: prefere arquivo local (public/imagens/{id}.png),
// cai no Pollinations.ai se o arquivo não existir.
// o script scripts/baixar-imagens.mjs popula a pasta local uma vez.

const BASE = 'https://image.pollinations.ai/prompt'

/** sanitiza ID para uso em caminho de arquivo */
function safeId(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function urlImagem(id) {
  return `/imagens/${safeId(id)}.png`
}

export function urlImagemRemota(id, termo) {
  const prompt = encodeURIComponent(`${termo}, product photo, studio lighting, white background`)
  // seed deve ser curto — usa hash simples do ID
  const seed = hashSimples(String(id))
  return `${BASE}/${prompt}?seed=${seed}&width=400&height=400&nologo=true`
}

export function svgFallback(termo) {
  const h = Math.abs(hashSimples(termo || 'produto')) % 360
  const cor = `hsl(${h & 360} 20% 88%)`
  const corTxt = `hsl(${h & 360} 35% 35%)`
  const texto = (termo || 'Produto').length > 25 ? termo.slice(0, 25) + '...' : (termo || 'Produto')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="400" height="400" fill="${cor}"/>
    <text x="200" y="200" text-anchor="middle" dominant-baseline="central"
          font-family="Archivo Narrow, sans-serif" font-size="18" fill="${corTxt}">
      ${texto}
    </text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function hashSimples(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}
