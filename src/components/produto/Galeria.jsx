import ImagemProduto from '../ui/ImagemProduto'

export default function Galeria({ produtoId, termoBusca, categoria, titulo }) {
  const termo = termoBusca || categoria

  return (
    <ImagemProduto
      id={produtoId}
      termo={termo}
      alt={titulo}
      className="aspect-square w-full"
    />
  )
}
