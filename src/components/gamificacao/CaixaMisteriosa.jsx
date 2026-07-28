import { useState, useEffect } from 'react'
import { useCaixaStore } from '../../store/useCaixaStore'
import { useMoedasStore } from '../../store/useMoedasStore'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'
import { tocarShakeCaixa, tocarAberturaCaixa, tocarSomMoeda } from '../../lib/som'

// recompensa variável de razão fixa: 1 dia = 1 abertura. o prêmio é quase
// sempre decepcionante, mas a incerteza mantém o hábito — mesma lógica da
// roleta, só que em ciclo diário em vez de imediato.
//
// a animação é teatral de propósito: 1,5s de shake pra gerar expectativa,
// depois uma explosão de partículas pra vender o momento, e aí o prêmio
// mixuruca aparece. a discrepância entre a fanfarra e o resultado é a piada.
const CORES_PARTICULAS = ['#ff5a1f', '#e1002a', '#ffc700', '#ff2e93', '#1c1710']

function criarParticulas(qtd) {
  return Array.from({ length: qtd }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: (Math.random() - 0.5) * 280,
    cor: CORES_PARTICULAS[i % CORES_PARTICULAS.length],
    tamanho: 8 + Math.random() * 14,
    rotacao: Math.random() * 360,
  }))
}

export default function CaixaMisteriosa({ padrao = 'reforco-intermitente' }) {
  const jaAbriuHoje = useCaixaStore((s) => s.jaAbriuHoje())
  const abrir = useCaixaStore((s) => s.abrir)
  const ganharMoedas = useMoedasStore((s) => s.ganhar)
  const aplicarCupom = useCarrinhoStore((s) => s.aplicarCupom)

  const [fase, setFase] = useState(jaAbriuHoje ? 'aberta' : 'idle')
  const [premio, setPremio] = useState(null)
  const [particulas, setParticulas] = useState([])

  useEffect(() => {
    if (jaAbriuHoje && fase === 'idle') setFase('aberta')
  }, [jaAbriuHoje, fase])

  function abrirCaixa() {
    if (fase !== 'idle') return

    setFase('shake')
    tocarShakeCaixa()

    setTimeout(() => {
      const resultado = abrir()
      if (!resultado) return

      setFase('explosao')
      setParticulas(criarParticulas(18))
      tocarAberturaCaixa()

      setTimeout(() => {
        setFase('resultado')
        setPremio(resultado)

        if (resultado.tipo === 'moedas') {
          ganharMoedas(resultado.valor, 'Caixa misteriosa')
          tocarSomMoeda()
        } else {
          aplicarCupom(resultado.valor)
        }
      }, 600)
    }, 1500)
  }

  return (
    <div
      data-padrao={padrao}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative">
        {/* particulas da explosao */}
        {particulas.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute"
            style={{
              left: '50%',
              top: '50%',
              width: p.tamanho,
              height: p.tamanho,
              backgroundColor: p.cor,
              transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotacao}deg)`,
              opacity: fase === 'resultado' ? 0 : 0.9,
              transition: 'opacity 1s ease-out',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            }}
          />
        ))}

        {/* caixa */}
        <div
          className={`hard-shadow flex h-40 w-40 items-center justify-center transition-all duration-100 md:h-60 md:w-60 ${
            fase === 'idle'
              ? 'cursor-pointer bg-laranja hover:scale-105 animate-pulse'
              : fase === 'shake'
                ? 'bg-rosa'
                : fase === 'explosao'
                  ? 'scale-110 bg-amarelo opacity-0'
                  : 'scale-0 opacity-0'
          }`}
          onClick={fase === 'idle' ? abrirCaixa : undefined}
          role={fase === 'idle' ? 'button' : undefined}
          aria-label="Abrir caixa misteriosa"
          style={
            fase === 'shake'
              ? { animation: 'shake 0.08s ease-in-out infinite' }
              : undefined
          }
        >
          {fase === 'idle' && (
            <span className="font-display text-5xl text-white md:text-8xl">?</span>
          )}
          {fase === 'shake' && (
            <span className="font-display text-5xl text-white md:text-8xl animate-pulse">
              !!
            </span>
          )}
        </div>
      </div>

      {/* resultado */}
      {fase === 'resultado' && premio && (
        <div className="hard-shadow w-full max-w-sm border-2 border-amarelo bg-white p-5 text-center md:p-8">
          <p className="font-display text-2xl text-laranja md:text-3xl">
            {premio.tipo === 'moedas' && premio.valor <= 1
              ? 'QUE PENA...'
              : premio.tipo === 'moedas' && premio.valor <= 3
                ? 'NADA MAL!'
                : premio.tipo === 'moedas'
                  ? 'BOA!'
                  : 'SORTE GRANDE!'}
          </p>

          <p className="mt-3 text-3xl font-display text-vermelho md:text-5xl">
            {premio.tipo === 'moedas'
              ? `${premio.valor} moeda${premio.valor > 1 ? 's' : ''}`
              : `CUPOM ${premio.valor}`}
          </p>

          <p className="mt-2 text-sm text-tinta/50 md:text-base">
            {premio.tipo === 'moedas' && premio.valor <= 1
              ? 'Tente de novo amanhã. Ou hoje, com outro navegador.'
              : premio.tipo === 'moedas' && premio.valor <= 3
                ? 'Já dá pra sentir o gostinho.'
                : premio.tipo === 'cupom'
                  ? '5% de desconto. Tá valendo!'
                  : 'Foi um bom dia.'}
          </p>

          {premio.tipo === 'cupom' && (
            <p className="mt-3 text-base font-semibold text-tinta">
              Use o cupom <span className="font-display text-laranja">{premio.valor}</span>
            </p>
          )}
        </div>
      )}

      {fase === 'aberta' && !premio && (
        <div className="hard-shadow w-full max-w-sm border border-tinta/10 bg-white p-6 text-center md:p-8">
          <p className="font-display text-xl text-tinta/50 md:text-2xl">
            VOCÊ JÁ ABRIU SUA CAIXA HOJE
          </p>
          <p className="mt-2 text-sm text-tinta/40 md:text-base">
            Volte amanhã pra tentar de novo. É de graça.
          </p>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%   { transform: translate(2px, -2px) rotate(1deg); }
          25%  { transform: translate(-4px, 3px) rotate(-3deg); }
          50%  { transform: translate(4px, -1px) rotate(4deg); }
          75%  { transform: translate(-2px, -4px) rotate(-2deg); }
          100% { transform: translate(1px, 2px) rotate(1deg); }
        }
      `}</style>
    </div>
  )
}
