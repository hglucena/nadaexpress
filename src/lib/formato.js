export function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarVendidos(quantidade) {
  if (quantidade < 1000) return `${quantidade} vendidos`
  const mil = quantidade / 1000
  const texto = Number.isInteger(mil) ? mil.toFixed(0) : mil.toFixed(1).replace('.', ',')
  return `${texto} mil vendidos`
}

import { hashDeString } from './aleatorio'

// aceita id numérico (mock) ou string ("off-12", "gerado-...") — qualquer um
// vira um matiz estável
export function corPlaceholder(id) {
  const numero = typeof id === 'number' ? id * 47 : hashDeString(String(id))
  return `hsl(${numero % 360} 65% 55%)`
}
