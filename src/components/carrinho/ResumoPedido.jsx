import { formatarPreco } from '../../lib/formato'

export default function ResumoPedido({ resumo, cupom }) {
  return (
    <div className="flex flex-col gap-1 p-3 text-sm">
      <div className="flex justify-between text-tinta/70">
        <span>Subtotal</span>
        <span>{formatarPreco(resumo.subtotal)}</span>
      </div>
      {cupom && (
        <div className="flex justify-between text-laranja">
          <span>Cupom {cupom.codigo}</span>
          <span>− {formatarPreco(resumo.desconto)}</span>
        </div>
      )}
      {resumo.descontoMoedas > 0 && (
        <div className="flex justify-between text-laranja">
          <span>🪙 NadaCoins</span>
          <span>− {formatarPreco(resumo.descontoMoedas)}</span>
        </div>
      )}
      <div className="flex justify-between text-tinta/70">
        <span>Frete</span>
        <span>Grátis</span>
      </div>
      <div className="mt-1 flex justify-between border-t border-tinta/10 pt-1 font-display text-lg text-tinta">
        <span>Total</span>
        <span>{formatarPreco(resumo.total)}</span>
      </div>
    </div>
  )
}
