// Sons sintetizados na hora via WebAudio — sem arquivo de áudio no bundle.
// O AudioContext só nasce depois de interação do usuário (política dos browsers).

let contexto = null

function obterContexto() {
  if (!contexto) {
    const Construtor = window.AudioContext ?? window.webkitAudioContext
    if (!Construtor) return null
    contexto = new Construtor()
  }
  if (contexto.state === 'suspended') contexto.resume()
  return contexto
}

function tocarNota(ctx, { frequencia, inicio, duracao, tipo = 'square', volume = 0.08 }) {
  const oscilador = ctx.createOscillator()
  const ganho = ctx.createGain()
  oscilador.type = tipo
  oscilador.frequency.value = frequencia
  ganho.gain.setValueAtTime(volume, ctx.currentTime + inicio)
  ganho.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracao)
  oscilador.connect(ganho)
  ganho.connect(ctx.destination)
  oscilador.start(ctx.currentTime + inicio)
  oscilador.stop(ctx.currentTime + inicio + duracao)
}

// duas notas subindo, som clássico de moeda de videogame
export function tocarSomMoeda() {
  const ctx = obterContexto()
  if (!ctx) return
  tocarNota(ctx, { frequencia: 988, inicio: 0, duracao: 0.09 })
  tocarNota(ctx, { frequencia: 1319, inicio: 0.09, duracao: 0.22 })
}

// tique seco de roleta — vai servir pro passo 13
export function tocarTique() {
  const ctx = obterContexto()
  if (!ctx) return
  tocarNota(ctx, { frequencia: 2200, inicio: 0, duracao: 0.03, tipo: 'triangle', volume: 0.05 })
}

// shake da caixa misteriosa — notas subindo rápido
export function tocarShakeCaixa() {
  const ctx = obterContexto()
  if (!ctx) return
  tocarNota(ctx, { frequencia: 440, inicio: 0, duracao: 0.08, tipo: 'square', volume: 0.06 })
  tocarNota(ctx, { frequencia: 554, inicio: 0.08, duracao: 0.08, tipo: 'square', volume: 0.06 })
  tocarNota(ctx, { frequencia: 659, inicio: 0.16, duracao: 0.08, tipo: 'square', volume: 0.06 })
  tocarNota(ctx, { frequencia: 880, inicio: 0.24, duracao: 0.15, tipo: 'square', volume: 0.06 })
}

// abertura da caixa — impacto grave + brilho agudo
export function tocarAberturaCaixa() {
  const ctx = obterContexto()
  if (!ctx) return
  tocarNota(ctx, { frequencia: 120, inicio: 0, duracao: 0.4, tipo: 'triangle', volume: 0.1 })
  tocarNota(ctx, { frequencia: 1600, inicio: 0.15, duracao: 0.35, tipo: 'sine', volume: 0.07 })
  tocarNota(ctx, { frequencia: 2400, inicio: 0.3, duracao: 0.3, tipo: 'sine', volume: 0.05 })
}
