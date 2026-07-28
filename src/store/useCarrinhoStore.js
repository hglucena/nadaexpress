import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const CUPONS_VALIDOS = {
  NADA10: { tipo: 'percentual', valor: 10 },
  BEMVINDO20: { tipo: 'fixo', valor: 20 },
  ROLETA5: { tipo: 'percentual', valor: 5 },
}

function gerarLinhaId(produtoId, cor, tamanho) {
  return `${produtoId}__${cor}__${tamanho}`
}

export const useCarrinhoStore = create(
  persist(
    (set, get) => ({
      itens: [],
      cupom: null,

      adicionarItem: (produto, { cor, tamanho, quantidade = 1 }) => {
        const linhaId = gerarLinhaId(produto.id, cor, tamanho)
        set((estado) => {
          const existente = estado.itens.find((item) => item.linhaId === linhaId)
          if (existente) {
            return {
              itens: estado.itens.map((item) =>
                item.linhaId === linhaId ? { ...item, quantidade: item.quantidade + quantidade } : item
              ),
            }
          }
          const novoItem = {
            linhaId,
            produtoId: produto.id,
            titulo: produto.titulo,
            preco: produto.preco,
            cor,
            tamanho,
            quantidade,
          }
          return { itens: [...estado.itens, novoItem] }
        })
      },

      incrementarQuantidade: (linhaId) => {
        set((estado) => ({
          itens: estado.itens.map((item) =>
            item.linhaId === linhaId ? { ...item, quantidade: item.quantidade + 1 } : item
          ),
        }))
      },

      decrementarQuantidade: (linhaId) => {
        set((estado) => {
          const item = estado.itens.find((item) => item.linhaId === linhaId)
          if (!item) return estado
          if (item.quantidade <= 1) {
            return { itens: estado.itens.filter((item) => item.linhaId !== linhaId) }
          }
          return {
            itens: estado.itens.map((item) =>
              item.linhaId === linhaId ? { ...item, quantidade: item.quantidade - 1 } : item
            ),
          }
        })
      },

      removerItem: (linhaId) => {
        set((estado) => ({ itens: estado.itens.filter((item) => item.linhaId !== linhaId) }))
      },

      aplicarCupom: (codigo) => {
        const codigoNormalizado = codigo.trim().toUpperCase()
        const cupom = CUPONS_VALIDOS[codigoNormalizado]
        if (!cupom) return false
        set({ cupom: { codigo: codigoNormalizado, ...cupom } })
        return true
      },

      removerCupom: () => set({ cupom: null }),

      limpar: () => set({ itens: [], cupom: null }),
    }),
    { name: 'nadaexpress-carrinho' }
  )
)

export function calcularResumo(itens, cupom, descontoMoedas = 0) {
  const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  const descontoBruto = cupom ? (cupom.tipo === 'percentual' ? subtotal * (cupom.valor / 100) : cupom.valor) : 0
  const desconto = Math.min(descontoBruto, subtotal)
  const moedas = Math.min(descontoMoedas, subtotal - desconto)
  return { subtotal, desconto, descontoMoedas: moedas, frete: 0, total: subtotal - desconto - moedas }
}

export const selecionarContagem = (estado) => estado.itens.reduce((soma, item) => soma + item.quantidade, 0)
