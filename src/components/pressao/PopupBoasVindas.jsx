import { useEffect, useState } from 'react'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'

const CHAVE = 'nadaexpress-boasvindas-vista'

// exibido uma vez por sessão — se a pessoa fechar, não volta mais.
// o botão de fechar é minúsculo e demora 4s pra aparecer: paciência como imposto.
export default function PopupBoasVindas({ padrao = 'obstrucao' }) {
  const [visivel, setVisivel] = useState(false)
  const [podeFechar, setPodeFechar] = useState(false)
  const [contagem, setContagem] = useState(6)
  const aplicarCupom = useCarrinhoStore((s) => s.aplicarCupom)

  // popup só abre depois de 8s na página
  useEffect(() => {
    if (sessionStorage.getItem(CHAVE)) return
    const t = setTimeout(() => setVisivel(true), 8000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visivel) return
    if (contagem <= 0) {
      setPodeFechar(true)
      return
    }
    const t = setTimeout(() => setContagem((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [contagem, visivel])

  function aceitar() {
    aplicarCupom('BEMVINDO20')
    fechar()
  }

  function fechar() {
    sessionStorage.setItem(CHAVE, '1')
    setVisivel(false)
  }

  if (!visivel) return null

  return (
    <div
      data-padrao={padrao}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-tinta/90 p-4"
      role="dialog"
      aria-label="Oferta de boas-vindas"
    >
      <div className="hard-shadow w-full max-w-sm border border-amarelo bg-white p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-tinta/40">PARE TUDO</p>

        <div className="mx-auto mt-3 w-fit rotate-[-3deg] border-2 border-dashed border-vermelho px-4 py-2">
          <p className="font-display text-4xl text-vermelho">R$ 20</p>
          <p className="text-[11px] text-tinta/60">de desconto na primeira compra</p>
        </div>

        <p className="mt-3 text-sm text-tinta/80">
          Cupom <span className="font-display text-laranja">BEMVINDO20</span> já colado pra você. É pegar ou largar.
        </p>

        <button
          type="button"
          onClick={aceitar}
          className="hard-shadow mt-4 w-full bg-vermelho px-6 py-3 font-display text-lg text-white"
        >
          QUERO MEUS R$ 20
        </button>

        {podeFechar ? (
          <button
            type="button"
            onClick={fechar}
            className="mt-3 text-xs text-tinta/30 hover:text-tinta/50"
          >
            Não, prefiro pagar o preço cheio
          </button>
        ) : (
          <p className="mt-3 text-xs text-tinta/20">
            o botão de fechar aparece em {contagem}s
          </p>
        )}
      </div>
    </div>
  )
}
