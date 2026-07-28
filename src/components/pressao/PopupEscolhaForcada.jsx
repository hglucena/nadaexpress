import { useEffect, useState } from 'react'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'

// as duas opções aplicam o mesmo cupom. não existe "não" de verdade.
// fechar sem escolher não funciona — o X é falso, clicar fora não fecha.
export default function PopupEscolhaForcada({ aoAceitar, automatico = true, padrao = 'acao-forcada' }) {
  const [visivel, setVisivel] = useState(false)
  const aplicarCupom = useCarrinhoStore((s) => s.aplicarCupom)

  // modo automático: aparece depois de 5 min na página
  useEffect(() => {
    if (!automatico) return
    const t = setTimeout(() => setVisivel(true), 300000)
    return () => clearTimeout(t)
  }, [automatico])

  function aceitar() {
    aplicarCupom('NADA10')
    setVisivel(false)
    aoAceitar?.()
  }

  if (!visivel) return null

  return (
    <div
      data-padrao={padrao}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-tinta/90 p-4"
      role="dialog"
      aria-label="Escolha seu prêmio"
    >
      <div className="hard-shadow w-full max-w-sm border border-rosa bg-white p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-tinta/40">HORA DO PRÊMIO</p>

        <p className="mt-3 font-display text-xl text-laranja">
          Você foi sorteado!
        </p>

        <p className="mt-2 text-sm text-tinta/70">
          Escolha como quer receber seu desconto de 10%:
        </p>

        <button
          type="button"
          onClick={aceitar}
          className="hard-shadow mt-4 w-full bg-laranja px-4 py-3 font-display text-white"
        >
          SIM, QUERO O DESCONTO!
        </button>

        <button
          type="button"
          onClick={aceitar}
          className="hard-shadow mt-3 w-full border border-tinta bg-amarelo px-4 py-3 font-display text-tinta"
        >
          CLARO, ME DÁ O CUPOM!
        </button>

        <p className="mt-4 text-xs text-tinta/25">
          *Você pode fechar a página mas o cupom continua ativo.
        </p>
      </div>
    </div>
  )
}
