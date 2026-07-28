import { useParams, Link } from 'react-router-dom'
import { usePedidosStore } from '../store/usePedidosStore'
import { formatarPreco } from '../lib/formato'
import ContadorMoedas from '../components/gamificacao/ContadorMoedas'
import RastreioPedido from '../components/pedido/RastreioPedido'

export default function Pedido() {
  const { id } = useParams()
  const pedido = usePedidosStore((estado) => estado.pedidos[id])

  if (!pedido) {
    return (
      <div className="p-8 text-center text-sm">
        <p className="mb-2">Esse pedido não existe. O que, cá entre nós, é o padrão por aqui.</p>
        <Link to="/" className="text-laranja underline">
          Voltar pra home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between bg-white p-2 text-sm">
        <Link to="/">← voltar</Link>
        <ContadorMoedas escuro />
      </div>

      <div className="p-3">
        <div className="flex flex-col items-center gap-1 py-6 text-center">
          <span className="text-4xl">✅</span>
          <h1 className="font-display text-2xl text-tinta">Pedido confirmado</h1>
          <p className="text-sm text-tinta/60">
            Número do pedido: <span className="text-laranja">{pedido.id}</span>
          </p>
        </div>

        <div className="border border-tinta/10">
          {pedido.itens.map((item) => (
            <div key={item.linhaId} className="flex justify-between border-b border-tinta/10 p-3 text-sm">
              <span className="line-clamp-1 pr-2 text-tinta/80">
                {item.quantidade}× {item.titulo}
              </span>
              <span className="shrink-0 text-tinta">{formatarPreco(item.preco * item.quantidade)}</span>
            </div>
          ))}
          <div className="flex justify-between p-3 font-display text-lg text-tinta">
            <span>Total pago</span>
            <span>{formatarPreco(pedido.resumo.total)}</span>
          </div>
        </div>

        {pedido.resumo.moedasGanhas > 0 && (
          <div className="hard-shadow mt-4 -rotate-1 border border-amarelo bg-amarelo/20 p-3 text-center text-sm text-tinta">
            Você ganhou <span className="font-display">🪙 {pedido.resumo.moedasGanhas} NadaCoins</span> nessa
            compra! Use no próximo pedido que também não vai chegar.
          </div>
        )}

        <div className="mt-4">
          <RastreioPedido pedidoId={pedido.id} />
        </div>

        <Link to="/" className="mt-4 block text-center text-sm text-laranja underline">
          Voltar pra home
        </Link>
      </div>
    </div>
  )
}
