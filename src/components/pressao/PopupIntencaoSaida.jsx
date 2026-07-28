import { useEffect, useState, useCallback } from 'react'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'

const CHAVE = 'nadaexpress-saida-vista'

// mouse no topo da tela = intenção de sair. no mobile, voltar pra home também dispara.
// desconto maior que o de boas-vindas pra segurar a pessoa no último segundo.
export default function PopupIntencaoSaida({ padrao = 'obstrucao' }) {
  const [visivel, setVisivel] = useState(false)
  const [jaMostrou, setJaMostrou] = useState(() => !!sessionStorage.getItem(CHAVE))
  const aplicarCupom = useCarrinhoStore((s) => s.aplicarCupom)

  const detectarSaida = useCallback(
    (e) => {
      if (jaMostrou || visivel) return
      setVisivel(true)
      setJaMostrou(true)
      sessionStorage.setItem(CHAVE, '1')
    },
    [jaMostrou, visivel]
  )

  useEffect(() => {
    function aoSairMouse(e) {
      if (e.clientY < 15 && !jaMostrou) detectarSaida(e)
    }
    document.addEventListener('mouseleave', aoSairMouse)
    return () => document.removeEventListener('mouseleave', aoSairMouse)
  }, [detectarSaida, jaMostrou])

  // no mobile, mostrar depois de 90s na página
  useEffect(() => {
    if (jaMostrou) return
    const t = setTimeout(() => detectarSaida(), 90000)
    return () => clearTimeout(t)
  }, [detectarSaida, jaMostrou])

  function aceitar() {
    aplicarCupom('NADA10')
    fechar()
  }

  function fechar() {
    setVisivel(false)
  }

  if (!visivel) return null

  return (
    <div
      data-padrao={padrao}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-tinta/90 p-4"
      role="dialog"
      aria-label="Espera! Tem desconto"
    >
      <div className="hard-shadow w-full max-w-sm border border-amarelo bg-white p-6 text-center">
        <p className="font-display text-2xl text-vermelho">ESPERA AÍ!</p>
        <p className="mt-2 text-sm text-tinta/70">
          Antes de sair... a gente separou um cupom <strong>só seu</strong>.
        </p>

        <div className="mx-auto mt-3 w-fit border-2 border-dashed border-amarelo bg-amarelo/10 px-4 py-2">
          <p className="font-display text-3xl text-tinta">10% OFF</p>
          <p className="text-[11px] text-tinta/50">Cupom NADA10</p>
        </div>

        <p className="mt-2 text-xs text-tinta/40">
          Só funciona nos próximos 3 minutos. Depois some.
        </p>

        <button
          type="button"
          onClick={aceitar}
          className="hard-shadow mt-4 w-full bg-vermelho px-6 py-3 font-display text-lg text-white animate-pulse"
        >
          QUERO 10% DE DESCONTO
        </button>

        <button
          type="button"
          onClick={fechar}
          className="mt-3 text-xs text-tinta/30 hover:text-tinta/50"
        >
          Não quero economizar, pode fechar
        </button>
      </div>
    </div>
  )
}
