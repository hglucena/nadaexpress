import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hojeLocal } from './useRoletaStore'

// caixa misteriosa diária. o prêmio é quase sempre decepcionante.
// 1 moeda é o resultado mais comum (70%) — o suficiente pra manter
// a pessoa voltando, insuficiente pra valer o tempo gasto.
const PREMIOS = [
  { tipo: 'moedas', valor: 1, peso: 70 },
  { tipo: 'moedas', valor: 3, peso: 20 },
  { tipo: 'moedas', valor: 5, peso: 8 },
  { tipo: 'cupom', valor: 'CAIXA5', peso: 2 },
]

function sortearPremio() {
  const total = PREMIOS.reduce((s, p) => s + p.peso, 0)
  let t = Math.random() * total
  for (const p of PREMIOS) {
    t -= p.peso
    if (t <= 0) return { tipo: p.tipo, valor: p.valor }
  }
  return { tipo: 'moedas', valor: 1 }
}

export const useCaixaStore = create(
  persist(
    (set, get) => ({
      ultimaAbertura: null,
      historico: [],

      jaAbriuHoje: () => get().ultimaAbertura === hojeLocal(),

      abrir: () => {
        if (get().jaAbriuHoje()) return null
        const premio = sortearPremio()
        set((s) => ({
          ultimaAbertura: hojeLocal(),
          historico: [{ ...premio, data: hojeLocal() }, ...s.historico].slice(0, 10),
        }))
        return premio
      },
    }),
    { name: 'nadaexpress-caixa' }
  )
)
