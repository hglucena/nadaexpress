import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 1 NadaCoin desconta R$ 0,10 no checkout. Desconto real em dinheiro de mentira
// num produto que nunca vai chegar — é a piada central do app, não consertar.
export const TAXA_CONVERSAO = 0.1

// cashback: 1 moeda a cada R$ 2 "gastos" — o ciclo compra falsa → moeda falsa
// → desconto falso é o que mantém a pessoa girando
export function moedasPorCompra(total) {
  return Math.floor(total / 2)
}

function novoLancamento(valor, motivo) {
  return { id: crypto.randomUUID(), valor, motivo, em: new Date().toISOString() }
}

export const useMoedasStore = create(
  persist(
    (set, get) => ({
      saldo: 50,
      historico: [novoLancamento(50, 'Bônus de boas-vindas')],

      ganhar: (valor, motivo) => {
        if (valor <= 0) return
        set((estado) => ({
          saldo: estado.saldo + valor,
          historico: [novoLancamento(valor, motivo), ...estado.historico].slice(0, 50),
        }))
      },

      gastar: (valor, motivo) => {
        const disponivel = get().saldo
        const gasto = Math.min(valor, disponivel)
        if (gasto <= 0) return 0
        set((estado) => ({
          saldo: estado.saldo - gasto,
          historico: [novoLancamento(-gasto, motivo), ...estado.historico].slice(0, 50),
        }))
        return gasto
      },
    }),
    { name: 'nadaexpress-moedas' }
  )
)
