import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrinhoStore, calcularResumo } from '../store/useCarrinhoStore'
import { usePedidosStore } from '../store/usePedidosStore'
import { useMoedasStore, TAXA_CONVERSAO, moedasPorCompra } from '../store/useMoedasStore'
import { formatarPreco } from '../lib/formato'
import ResumoPedido from '../components/carrinho/ResumoPedido'

const CAMPO_CLASSE = 'border border-tinta/20 px-2 py-2 text-sm focus:outline-none focus:border-laranja'

export default function Checkout() {
  const itens = useCarrinhoStore((estado) => estado.itens)
  const cupom = useCarrinhoStore((estado) => estado.cupom)
  const limparCarrinho = useCarrinhoStore((estado) => estado.limpar)
  const criarPedido = usePedidosStore((estado) => estado.criarPedido)
  const saldoMoedas = useMoedasStore((estado) => estado.saldo)
  const gastarMoedas = useMoedasStore((estado) => estado.gastar)
  const ganharMoedas = useMoedasStore((estado) => estado.ganhar)
  const navigate = useNavigate()

  const [endereco, setEndereco] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })
  const [pagamento, setPagamento] = useState('cartao')
  const [usarMoedas, setUsarMoedas] = useState(false)

  const descontoMoedas = usarMoedas ? saldoMoedas * TAXA_CONVERSAO : 0
  const resumo = calcularResumo(itens, cupom, descontoMoedas)
  const moedasUsadas = usarMoedas ? Math.round(resumo.descontoMoedas / TAXA_CONVERSAO) : 0

  function atualizarCampo(campo) {
    return (evento) => setEndereco((atual) => ({ ...atual, [campo]: evento.target.value }))
  }

  function handleFinalizar(evento) {
    evento.preventDefault()
    const moedasGanhas = moedasPorCompra(resumo.total)
    const id = criarPedido(itens, { ...resumo, moedasGanhas })
    if (moedasUsadas > 0) gastarMoedas(moedasUsadas, `Desconto no pedido ${id}`)
    if (moedasGanhas > 0) ganharMoedas(moedasGanhas, `Cashback do pedido ${id}`)
    limparCarrinho()
    navigate(`/pedido/${id}`)
  }

  if (itens.length === 0) {
    return (
      <div className="p-8 text-center text-sm">
        <p className="mb-2">Não dá pra finalizar um pedido vazio. Nem esse tanto faz sentido fingir.</p>
        <Link to="/" className="text-laranja underline">
          Voltar pra home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center bg-white p-2 text-sm">
        <Link to="/carrinho">← voltar</Link>
        <h1 className="mx-auto font-display text-lg text-tinta">Checkout</h1>
      </div>

      <form onSubmit={handleFinalizar} className="flex flex-col gap-4 p-3">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-display text-tinta">Endereço de entrega</legend>
          <input
            required
            placeholder="CEP"
            value={endereco.cep}
            onChange={atualizarCampo('cep')}
            className={CAMPO_CLASSE}
          />
          <input
            required
            placeholder="Rua"
            value={endereco.rua}
            onChange={atualizarCampo('rua')}
            className={CAMPO_CLASSE}
          />
          <div className="flex gap-2">
            <input
              required
              placeholder="Número"
              value={endereco.numero}
              onChange={atualizarCampo('numero')}
              className={`${CAMPO_CLASSE} flex-1`}
            />
            <input
              placeholder="Complemento"
              value={endereco.complemento}
              onChange={atualizarCampo('complemento')}
              className={`${CAMPO_CLASSE} flex-1`}
            />
          </div>
          <input
            required
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={atualizarCampo('bairro')}
            className={CAMPO_CLASSE}
          />
          <div className="flex gap-2">
            <input
              required
              placeholder="Cidade"
              value={endereco.cidade}
              onChange={atualizarCampo('cidade')}
              className={`${CAMPO_CLASSE} flex-1`}
            />
            <input
              required
              placeholder="Estado"
              value={endereco.estado}
              onChange={atualizarCampo('estado')}
              className={`${CAMPO_CLASSE} w-20`}
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-display text-tinta">Forma de pagamento</legend>
          {[
            { valor: 'cartao', rotulo: 'Cartão de crédito' },
            { valor: 'pix', rotulo: 'Pix' },
            { valor: 'boleto', rotulo: 'Boleto' },
          ].map((opcao) => (
            <label key={opcao.valor} className="flex items-center gap-2 text-sm text-tinta">
              <input
                type="radio"
                name="pagamento"
                value={opcao.valor}
                checked={pagamento === opcao.valor}
                onChange={() => setPagamento(opcao.valor)}
              />
              {opcao.rotulo}
            </label>
          ))}
          <p className="text-xs text-tinta/50">Nenhum dado de pagamento é solicitado de verdade.</p>
        </fieldset>

        {saldoMoedas > 0 && (
          <label className="flex items-center gap-2 border border-amarelo bg-amarelo/10 p-3 text-sm text-tinta">
            <input
              type="checkbox"
              checked={usarMoedas}
              onChange={(evento) => setUsarMoedas(evento.target.checked)}
            />
            <span>
              Usar meus <span className="font-display">🪙 {saldoMoedas}</span> NadaCoins
              <span className="text-laranja"> (− {formatarPreco(saldoMoedas * TAXA_CONVERSAO)})</span>
            </span>
          </label>
        )}

        <ResumoPedido resumo={resumo} cupom={cupom} />

        <button type="submit" className="hard-shadow bg-laranja py-3 font-display text-white">
          FINALIZAR PEDIDO
        </button>
      </form>
    </div>
  )
}
