import { Link } from 'react-router-dom'
import { useCarrinhoStore, calcularResumo } from '../store/useCarrinhoStore'
import ItemCarrinho from '../components/carrinho/ItemCarrinho'
import CampoCupom from '../components/carrinho/CampoCupom'
import ResumoPedido from '../components/carrinho/ResumoPedido'

export default function Carrinho() {
  const itens = useCarrinhoStore((estado) => estado.itens)
  const cupom = useCarrinhoStore((estado) => estado.cupom)
  const resumo = calcularResumo(itens, cupom)

  return (
    <div>
      <div className="flex items-center bg-white p-2 text-sm">
        <Link to="/">← voltar</Link>
        <h1 className="mx-auto font-display text-lg text-tinta">Carrinho</h1>
      </div>

      {itens.length === 0 ? (
        <div className="p-8 text-center text-sm">
          <p className="mb-2">Seu carrinho não tem nada. Que apropriado.</p>
          <Link to="/" className="text-laranja underline">
            Ver produtos que também não existem
          </Link>
        </div>
      ) : (
        <>
          <div>
            {itens.map((item) => (
              <ItemCarrinho key={item.linhaId} item={item} />
            ))}
          </div>
          <CampoCupom />
          <ResumoPedido resumo={resumo} cupom={cupom} />
          <div className="p-3">
            <Link
              to="/checkout"
              className="hard-shadow block bg-laranja py-3 text-center font-display text-white"
            >
              IR PARA O CHECKOUT
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
