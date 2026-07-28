import { useState } from 'react'
import { useConviteStore } from '../../store/useConviteStore'

function gerarLinkConvite() {
  const codigo = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `https://nadaexpress.app/?convite=${codigo}`
}

export default function MissaoSocial({ padrao = 'acao-forcada' }) {
  const convitesEnviados = useConviteStore((s) => s.convitesEnviados)
  const meta = useConviteStore((s) => s.meta)
  const progressoVisual = useConviteStore((s) => s.progressoVisual())
  const registrarConvite = useConviteStore((s) => s.registrarConvite)
  const [copiado, setCopiado] = useState(false)

  function convidar() {
    const link = gerarLinkConvite()

    if (navigator.share) {
      navigator.share({
        title: 'NadaExpress',
        text: `Entra aí com meu link pra gente ganhar desconto: ${link}`,
        url: link,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(link)
        .then(() => {
          setCopiado(true)
          setTimeout(() => setCopiado(false), 2000)
        })
        .catch(() => {})
    }

    registrarConvite()
  }

  return (
    <div
      data-padrao={padrao}
      className="hard-shadow mx-3 mt-3 overflow-hidden border border-amarelo bg-white"
    >
      <div className="flex items-center justify-between bg-amarelo px-3 py-2">
        <p className="font-display text-sm text-tinta">
          🎁 MISSÃO DOS AMIGOS
        </p>
        <span className="text-xs text-tinta/60">
          {convitesEnviados}/{meta}
        </span>
      </div>

      <div className="p-3">
        <p className="text-sm text-tinta/80">
          {convitesEnviados === 0
            ? 'Convide 3 amigos e libere um cupom secreto!'
            : meta - convitesEnviados === 1
              ? 'Só mais 1 amigo pra liberar o prêmio!'
              : `Falta${meta - convitesEnviados > 1 ? 'm' : ''} ${meta - convitesEnviados} amigo${meta - convitesEnviados > 1 ? 's' : ''}! Não para agora.`}
        </p>

        <div className="mt-2 h-2 w-full rounded-full bg-tinta/10">
          <div
            className="h-2 rounded-full bg-laranja transition-all duration-700"
            style={{ width: `${progressoVisual}%` }}
          />
        </div>

        <p className="mt-1 text-right text-xs font-semibold text-laranja">
          {Math.round(progressoVisual)}%
        </p>

        <button
          type="button"
          onClick={convidar}
          className="hard-shadow mt-3 w-full bg-vermelho px-4 py-2 font-display text-sm text-white"
        >
          {copiado ? 'LINK COPIADO!' : '📤 CONVIDAR AMIGO'}
        </button>

        {convitesEnviados > 0 && (
          <p className="mt-2 text-center text-[11px] text-tinta/30">
            Seus amigos não precisam aceitar. A gente conta mesmo assim.
          </p>
        )}
      </div>
    </div>
  )
}
