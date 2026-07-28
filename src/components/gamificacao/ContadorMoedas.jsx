import { useEffect, useRef, useState } from 'react'
import { useMoedasStore } from '../../store/useMoedasStore'
import { formatarPreco } from '../../lib/formato'
import { TAXA_CONVERSAO } from '../../store/useMoedasStore'
import { tocarSomMoeda } from '../../lib/som'

const DURACAO_ANIMACAO_MS = 800

// Contador que sobe dígito a dígito com som quando o saldo aumenta.
// Moeda virtual descola o "valor" do dinheiro real — a pessoa acumula um número
// que só vale dentro do app, e número subindo com sonzinho é recompensa em si.
export default function ContadorMoedas({ escuro = false, padrao = 'moeda-virtual' }) {
  const saldo = useMoedasStore((estado) => estado.saldo)
  const historico = useMoedasStore((estado) => estado.historico)
  const [exibido, setExibido] = useState(() => {
    // se acabou de ganhar (ex: chegou na confirmação do pedido), anima a partir do valor antigo
    const ultimo = historico[0]
    const recente = ultimo && ultimo.valor > 0 && Date.now() - new Date(ultimo.em).getTime() < 4000
    return recente ? saldo - ultimo.valor : saldo
  })
  const [aberto, setAberto] = useState(false)
  const [pulsando, setPulsando] = useState(false)
  const quadroRef = useRef(null)
  const exibidoRef = useRef(exibido)
  exibidoRef.current = exibido

  useEffect(() => {
    const partida = exibidoRef.current
    if (partida === saldo) return

    if (saldo > partida) {
      tocarSomMoeda()
      setPulsando(true)
    }

    const inicio = performance.now()
    function passo(agora) {
      const progresso = Math.min(1, (agora - inicio) / DURACAO_ANIMACAO_MS)
      const suave = 1 - (1 - progresso) ** 3
      setExibido(Math.round(partida + (saldo - partida) * suave))
      if (progresso < 1) {
        quadroRef.current = requestAnimationFrame(passo)
      } else {
        setPulsando(false)
      }
    }
    quadroRef.current = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadroRef.current)
  }, [saldo])

  const corTexto = escuro ? 'text-tinta' : 'text-white'

  return (
    <div className="relative" data-padrao={padrao}>
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-expanded={aberto}
        aria-label={`Saldo de ${saldo} NadaCoins, ver histórico`}
        className={`flex items-center gap-1 text-sm ${corTexto}`}
      >
        <span aria-hidden="true" className={`inline-block transition-transform ${pulsando ? 'scale-125' : ''}`}>
          🪙
        </span>
        <span className="font-display tabular-nums">{exibido}</span>
      </button>

      {aberto && (
        <div className="hard-shadow absolute right-0 top-full z-30 mt-2 w-64 border border-tinta/10 bg-white p-3 text-tinta">
          <p className="mb-1 font-display">NadaCoins</p>
          <p className="mb-2 text-xs text-tinta/60">
            {saldo} moedas = {formatarPreco(saldo * TAXA_CONVERSAO)} de desconto em produtos que não existem
          </p>
          <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto text-xs">
            {historico.map((lancamento) => (
              <li key={lancamento.id} className="flex justify-between gap-2 border-t border-tinta/10 pt-1">
                <span className="text-tinta/70">{lancamento.motivo}</span>
                <span className={lancamento.valor > 0 ? 'text-laranja' : 'text-tinta/50'}>
                  {lancamento.valor > 0 ? '+' : ''}
                  {lancamento.valor}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
