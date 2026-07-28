// Aleatoriedade determinística: mesma semente, mesma sequência. Usado pelo
// gerador do dataset offline e pelo app (amostragem estável de reviews por produto).

export function hashDeString(texto) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function criarRng(semente) {
  let a = semente >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function sortearItem(rng, lista) {
  return lista[Math.floor(rng() * lista.length)]
}

export function sortearInteiro(rng, minimo, maximo) {
  return minimo + Math.floor(rng() * (maximo - minimo + 1))
}

export function embaralhar(rng, lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
