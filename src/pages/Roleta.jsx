import { useState } from 'react'
import { Link } from 'react-router-dom'
import RoletaDoNada from '../components/gamificacao/RoletaDoNada'
import AnuncioFalso from '../components/gamificacao/AnuncioFalso'
import ContadorMoedas from '../components/gamificacao/ContadorMoedas'
import { useRoletaStore } from '../store/useRoletaStore'

export default function Roleta() {
  const girosDisponiveis = useRoletaStore((estado) => estado.girosDisponiveis())
  const [mostrandoAnuncio, setMostrandoAnuncio] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between bg-white p-2 text-sm">
        <Link to="/">← voltar</Link>
        <ContadorMoedas escuro />
      </div>

      <div className="flex flex-col items-center gap-3 p-4">
        <h1 className="font-display text-3xl text-laranja">ROLETA DO NADA</h1>
        <p className="text-sm text-tinta/70">
          Você tem <span className="font-display text-vermelho">{girosDisponiveis}</span>{' '}
          {girosDisponiveis === 1 ? 'giro' : 'giros'} · 1 giro grátis por dia*
        </p>

        <RoletaDoNada />

        {girosDisponiveis === 0 && (
          <button
            type="button"
            onClick={() => setMostrandoAnuncio(true)}
            className="hard-shadow -rotate-1 border border-vermelho bg-amarelo px-5 py-2 font-display text-tinta"
          >
            🎬 ASSISTA UM ANÚNCIO E GANHE +1 GIRO
          </button>
        )}

        <p className="mt-2 text-[11px] text-tinta/40">*ou mais. A gente sempre dá um jeito.</p>
      </div>

      {mostrandoAnuncio && <AnuncioFalso aoFechar={() => setMostrandoAnuncio(false)} />}
    </div>
  )
}
