import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function gerarNumeroPedido() {
  const ano = new Date().getFullYear()
  const aleatorio = Math.floor(100000 + Math.random() * 900000)
  return `NE${ano}${aleatorio}`
}

export const usePedidosStore = create(
  persist(
    (set, get) => ({
      pedidos: {},

      criarPedido: (itens, resumo) => {
        const id = gerarNumeroPedido()
        const pedido = { id, itens, resumo, criadoEm: new Date().toISOString() }
        set((estado) => ({ pedidos: { ...estado.pedidos, [id]: pedido } }))
        return id
      },

      buscarPedido: (id) => get().pedidos[id],
    }),
    { name: 'nadaexpress-pedidos' }
  )
)
