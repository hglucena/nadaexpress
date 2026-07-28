import CardProduto from '../produto/CardProduto'
import CardProdutoSkeleton from '../produto/CardProdutoSkeleton'

export default function GradeProdutos({ produtos, carregandoMais, sentinelaRef }) {
  if (produtos.length === 0) {
    return <p className="p-8 text-center text-sm text-tinta/60">Nenhum produto que não existe encontrado.</p>
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-5 md:gap-3 md:p-3">
        {produtos.map((produto) => (
          <CardProduto key={produto.id} produto={produto} />
        ))}
        {carregandoMais &&
          Array.from({ length: 4 }, (_, indice) => <CardProdutoSkeleton key={`skeleton-${indice}`} />)}
      </div>
      <div ref={sentinelaRef} aria-hidden="true" />
    </div>
  )
}
