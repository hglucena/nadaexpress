import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { produtosMock } from '../data/mock-produtos'
import BarraBusca from '../components/home/BarraBusca'
import CarrosselBanners from '../components/home/CarrosselBanners'
import LinhaCategorias from '../components/home/LinhaCategorias'
import GradeProdutos from '../components/home/GradeProdutos'
import { useCarrinhoStore, selecionarContagem } from '../store/useCarrinhoStore'
import { useProdutosInfinitos } from '../hooks/useProdutosInfinitos'
import ContadorMoedas from '../components/gamificacao/ContadorMoedas'
import MissaoSocial from '../components/gamificacao/MissaoSocial'

export default function Home() {
  const [termo, setTermo] = useState('')
  const [categoria, setCategoria] = useState(null)
  const contagemCarrinho = useCarrinhoStore(selecionarContagem)
  const { produtosExtras, sentinelaRef, carregandoMais } = useProdutosInfinitos({ categoria, termo })

  const produtosFiltrados = useMemo(() => {
    const termoBusca = termo.trim().toLowerCase()
    return [...produtosMock, ...produtosExtras].filter((produto) => {
      const bateBusca = termoBusca === '' || produto.titulo.toLowerCase().includes(termoBusca)
      const bateCategoria = categoria === null || produto.categoria === categoria
      return bateBusca && bateCategoria
    })
  }, [termo, categoria, produtosExtras])

  return (
    <div>
      <header className="flex items-center gap-3 bg-laranja px-3 py-2">
        <Link to="/" className="font-display text-xl text-white shrink-0">
          NADAEXPRESS
        </Link>
        <div className="flex-1">
          <BarraBusca valor={termo} onChange={setTermo} />
        </div>
        <ContadorMoedas />
        <Link to="/carrinho" aria-label="Carrinho" className="relative shrink-0 text-xl text-white">
          🛒
          {contagemCarrinho > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-vermelho text-[10px] text-white">
              {contagemCarrinho}
            </span>
          )}
        </Link>
      </header>

      <CarrosselBanners />
      <MissaoSocial />
      <LinhaCategorias selecionada={categoria} onSelecionar={setCategoria} />
      <GradeProdutos produtos={produtosFiltrados} carregandoMais={carregandoMais} sentinelaRef={sentinelaRef} />
    </div>
  )
}
