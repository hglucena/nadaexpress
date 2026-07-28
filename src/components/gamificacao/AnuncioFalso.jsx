import { useEffect, useState } from 'react'
import { useRoletaStore } from '../../store/useRoletaStore'

// "Assista um anúncio e ganhe +1 giro" — ação forçada: a pessoa troca 5 segundos
// de atenção cativa por outra chance na roleta. O anúncio nem existe; a espera é
// o produto. O botão de fechar só aparece no fim, como nos jogos mobile.
export default function AnuncioFalso({ aoFechar, padrao = 'acao-forcada' }) {
  const [restante, setRestante] = useState(5)
  const ganharGiroExtra = useRoletaStore((estado) => estado.ganharGiroExtra)

  useEffect(() => {
    if (restante === 0) return
    const timer = setTimeout(() => setRestante((atual) => atual - 1), 1000)
    return () => clearTimeout(timer)
  }, [restante])

  function resgatar() {
    ganharGiroExtra()
    aoFechar()
  }

  return (
    <div
      data-padrao={padrao}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-tinta/90 p-6"
      role="dialog"
      aria-label="Anúncio"
    >
      <div className="hard-shadow w-full max-w-sm bg-white p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-tinta/40">Anúncio</p>
        <p className="mt-3 font-display text-2xl text-laranja">PRODUTO INCRÍVEL QUE NÃO EXISTE™</p>
        <p className="mt-2 text-sm text-tinta/70">
          Milhares de pessoas também não compraram. Junte-se a elas.
        </p>
        <div className="mx-auto mt-4 h-2 w-full bg-tinta/10">
          <div
            className="h-2 bg-vermelho transition-all duration-1000"
            style={{ width: `${((5 - restante) / 5) * 100}%` }}
          />
        </div>
        {restante > 0 ? (
          <p className="mt-3 text-sm text-tinta/60">Seu giro libera em {restante}s...</p>
        ) : (
          <button
            type="button"
            onClick={resgatar}
            className="hard-shadow mt-4 bg-laranja px-6 py-2 font-display text-white"
          >
            RESGATAR +1 GIRO
          </button>
        )}
      </div>
    </div>
  )
}
