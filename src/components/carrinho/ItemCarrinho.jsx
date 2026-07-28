import { corPlaceholder, formatarPreco } from '../../lib/formato'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'

export default function ItemCarrinho({ item }) {
  const incrementarQuantidade = useCarrinhoStore((estado) => estado.incrementarQuantidade)
  const decrementarQuantidade = useCarrinhoStore((estado) => estado.decrementarQuantidade)
  const removerItem = useCarrinhoStore((estado) => estado.removerItem)

  return (
    <div className="flex gap-3 border-b border-tinta/10 p-3">
      <div className="h-16 w-16 shrink-0" style={{ backgroundColor: corPlaceholder(item.produtoId) }} />
      <div className="flex flex-1 flex-col gap-1">
        <p className="line-clamp-2 text-xs text-tinta">{item.titulo}</p>
        <p className="text-[11px] text-tinta/50">
          {item.cor} · {item.tamanho}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => decrementarQuantidade(item.linhaId)}
              className="h-6 w-6 border border-tinta/20 text-tinta"
            >
              −
            </button>
            <span className="w-4 text-center text-sm">{item.quantidade}</span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => incrementarQuantidade(item.linhaId)}
              className="h-6 w-6 border border-tinta/20 text-tinta"
            >
              +
            </button>
          </div>
          <p className="font-display text-vermelho">{formatarPreco(item.preco * item.quantidade)}</p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Remover item"
        onClick={() => removerItem(item.linhaId)}
        className="self-start text-tinta/40"
      >
        ×
      </button>
    </div>
  )
}
