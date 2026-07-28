import { Link } from 'react-router-dom'
import { formatarPreco, formatarVendidos } from '../../lib/formato'
import ImagemProduto from '../ui/ImagemProduto'
import SeloDesconto from './SeloDesconto'

export default function CardProduto({ produto }) {
  return (
    <Link
      to={`/produto/${produto.id}`}
      className="hover:hard-shadow flex flex-col border border-tinta/10 bg-white transition-shadow"
    >
      <div className="relative">
        <ImagemProduto
          id={produto.id}
          termo={produto.termoBusca || produto.categoria}
          alt={produto.titulo}
          className="aspect-square w-full"
        />
        <div className="absolute left-1 top-1">
          <SeloDesconto porcentagem={produto.desconto} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <p className="line-clamp-2 text-xs leading-tight">{produto.titulo}</p>
        <div className="mt-auto">
          <p className="text-xs text-tinta/50 line-through">{formatarPreco(produto.precoOriginal)}</p>
          <p className="font-display text-lg text-vermelho">{formatarPreco(produto.preco)}</p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-tinta/70">
          <span>★ {produto.nota.toFixed(1)}</span>
          <span>{formatarVendidos(produto.vendidos)}</span>
        </div>
      </div>
    </Link>
  )
}
