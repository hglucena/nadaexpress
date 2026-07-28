// MODO_OFFLINE: o app inteiro roda sem nenhuma chamada de rede, servindo o
// dataset estático de src/data/fallback/. É o plano de contingência da
// apresentação. Liga por variável de build (VITE_MODO_OFFLINE=1) ou em runtime
// via localStorage — o atalho secreto do item 25 vai usar o segundo caminho.

const CHAVE_LOCAL = 'nadaexpress-offline'

export function modoOffline() {
  if (import.meta.env.VITE_MODO_OFFLINE === '1') return true
  try {
    return localStorage.getItem(CHAVE_LOCAL) === '1'
  } catch {
    return false
  }
}

export function definirModoOffline(ligado) {
  try {
    if (ligado) localStorage.setItem(CHAVE_LOCAL, '1')
    else localStorage.removeItem(CHAVE_LOCAL)
  } catch {
    // sem localStorage não há como persistir a escolha — segue o padrão
  }
}
