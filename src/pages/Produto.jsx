import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { encontrarProduto } from '../lib/catalogo'
import { formatarPreco, formatarVendidos } from '../lib/formato'
import Galeria from '../components/produto/Galeria'
import SeletorVariacao, { CORES, TAMANHOS } from '../components/produto/SeletorVariacao'
import BlocoFrete from '../components/produto/BlocoFrete'
import Avaliacoes from '../components/produto/Avaliacoes'
import ListaReviews from '../components/produto/ListaReviews'
import BotoesCompra from '../components/produto/BotoesCompra'
import ContadorRegressivo from '../components/pressao/ContadorRegressivo'
import EstoqueBaixo from '../components/pressao/EstoqueBaixo'
import PessoasVendo from '../components/pressao/PessoasVendo'
import NotificacaoFantasma from '../components/pressao/NotificacaoFantasma'
import ChatVendedor from '../components/produto/ChatVendedor'
import { useCarrinhoStore, selecionarContagem } from '../store/useCarrinhoStore'
import { useReviews } from '../hooks/useReviews'
import ContadorMoedas from '../components/gamificacao/ContadorMoedas'

export default function Produto() {
  const { id } = useParams()
  const produto = encontrarProduto(id)
  const contagemCarrinho = useCarrinhoStore(selecionarContagem)
  const [cor, setCor] = useState(CORES[0])
  const [tamanho, setTamanho] = useState(TAMANHOS[0])
  const { reviews, carregando: carregandoReviews } = useReviews(produto)
  const [chatAberto, setChatAberto] = useState(false)

  if (!produto) {
    return (
      <div className="p-8 text-center text-sm">
        <p className="mb-2">Esse produto não existe. Aliás, nenhum aqui existe.</p>
        <Link to="/" className="text-laranja underline">
          Voltar pra home
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0">
      <div className="flex items-center justify-between bg-white p-2 text-sm">
        <Link to="/">← voltar</Link>
        <div className="flex items-center gap-4">
          <ContadorMoedas escuro />
          <Link to="/carrinho" aria-label="Carrinho" className="relative">
            🛒
            {contagemCarrinho > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-vermelho text-[10px] text-white">
                {contagemCarrinho}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="md:flex md:gap-6 md:p-4 md:max-w-5xl md:mx-auto">
        <div className="md:w-1/2 md:sticky md:top-0 md:self-start">
          <Galeria produtoId={produto.id} termoBusca={produto.termoBusca} categoria={produto.categoria} titulo={produto.titulo} />
        </div>

        <div className="md:w-1/2">
          <h1 className="p-3 text-base leading-snug text-tinta">{produto.titulo}</h1>

          <div className="flex items-center gap-2 px-3 text-xs text-tinta/60">
            <span>★ {produto.nota.toFixed(1)}</span>
            <span>·</span>
            <span>{formatarVendidos(produto.vendidos)}</span>
            <span>·</span>
            <span>{produto.categoria}</span>
          </div>

          <div className="flex flex-col items-start gap-2 p-3">
            <p className="text-sm text-tinta/50 line-through">{formatarPreco(produto.precoOriginal)}</p>
            <p className="font-display text-4xl text-vermelho">{formatarPreco(produto.preco)}</p>
            <div className="flex flex-wrap items-center gap-3">
              <ContadorRegressivo />
              <EstoqueBaixo idProduto={produto.id} />
            </div>
            <PessoasVendo />
          </div>

          <SeletorVariacao cor={cor} tamanho={tamanho} onMudarCor={setCor} onMudarTamanho={setTamanho} />
          <BlocoFrete />

          <div className="hidden md:block md:p-3">
            <BotoesCompra produto={produto} cor={cor} tamanho={tamanho} />
          </div>
        </div>
      </div>

      <div className="md:max-w-5xl md:mx-auto">
        <div className="p-3">
          <h2 className="mb-2 font-display text-lg text-tinta">Descrição</h2>
          <p className="text-sm text-tinta/80">{produto.descricao}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(produto.specs).map(([chave, valor]) => (
              <div key={chave} className="border border-tinta/10 p-2">
                <dt className="capitalize text-tinta/50">{chave.replace('_', ' ')}</dt>
                <dd className="text-tinta">{valor}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => setChatAberto(true)}
            className="hard-shadow mt-4 w-full border border-laranja bg-white px-4 py-2 font-display text-sm text-laranja md:w-auto"
          >
            💬 FALAR COM O VENDEDOR
          </button>
        </div>

        <Avaliacoes nota={produto.nota} vendidos={produto.vendidos} />
        <ListaReviews reviews={reviews} carregando={carregandoReviews} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-tinta/10 bg-white md:hidden">
        <BotoesCompra produto={produto} cor={cor} tamanho={tamanho} />
      </div>

      <NotificacaoFantasma />

      {chatAberto && (
        <ChatVendedor produto={produto} aoFechar={() => setChatAberto(false)} />
      )}
    </div>
  )
}
