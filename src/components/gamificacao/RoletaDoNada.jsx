import { useRef, useState } from 'react'
import { useRoletaStore } from '../../store/useRoletaStore'
import { useMoedasStore } from '../../store/useMoedasStore'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'
import { tocarTique, tocarSomMoeda } from '../../lib/som'

// MECÂNICA DE CAÇA-NÍQUEL, documentada de propósito — é o objeto de estudo do app:
//
// 1. Reforço intermitente de razão variável: prêmio imprevisível a cada giro é o
//    esquema de recompensa que mais induz repetição compulsiva (Skinner). A pessoa
//    não gira pelo prêmio, gira pela incerteza.
// 2. Near-miss: em ~40% dos giros o resultado é decidido AQUI, antes de qualquer
//    animação, como "quase jackpot" — e a animação é coreografada pra roleta
//    desacelerar DENTRO da fatia de R$ 500 e morrer logo depois dela. O cérebro
//    processa quase-vitória como progresso, não como derrota (Reid, 1986; Clark
//    et al., 2009), o que aumenta a vontade de girar de novo em vez de reduzir.
// 3. Aqui o near-miss ainda entrega "+1 giro": frustração e o meio de tentar de
//    novo no mesmo resultado — o loop de re-engajamento clássico de cassino.
// 4. A física é de mentira. O ponteiro nunca "decide" nada: o suspense inteiro é
//    teatro construído de trás pra frente a partir do resultado sorteado.
//
// Fatias em graus desiguais de propósito: o prêmio grande é fino e chamativo, os
// prêmios pequenos são largos. A percepção de chance vem da área visual, não da
// probabilidade real (que pro jackpot é zero).

const FATIAS = [
  { rotulo: 'R$ 500', graus: 10, cor: 'var(--color-amarelo)', texto: '#1c1710', tipo: 'jackpot' },
  { rotulo: '5 moedas', graus: 70, cor: '#ffffff', texto: '#1c1710', tipo: 'moedas', valor: 5 },
  { rotulo: 'CUPOM 5%', graus: 55, cor: 'var(--color-laranja)', texto: '#ffffff', tipo: 'cupom', codigo: 'ROLETA5' },
  { rotulo: '10 moedas', graus: 60, cor: '#ffffff', texto: '#1c1710', tipo: 'moedas', valor: 10 },
  { rotulo: 'FRETE GRÁTIS', graus: 55, cor: 'var(--color-rosa)', texto: '#ffffff', tipo: 'frete' },
  { rotulo: 'CUPOM 10%', graus: 40, cor: 'var(--color-laranja)', texto: '#ffffff', tipo: 'cupom', codigo: 'NADA10' },
  { rotulo: '20 moedas', graus: 45, cor: '#ffffff', texto: '#1c1710', tipo: 'moedas', valor: 20 },
  { rotulo: '+1 GIRO', graus: 25, cor: 'var(--color-vermelho)', texto: '#ffffff', tipo: 'giroExtra' },
]

const INICIOS = FATIAS.reduce((acc, fatia, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + FATIAS[i - 1].graus)
  return acc
}, [])

// pesos do sorteio — o jackpot não aparece: probabilidade real zero
const SORTEIO = [
  { nearMiss: true, peso: 40 },
  { indice: 1, peso: 18 },
  { indice: 3, peso: 12 },
  { indice: 2, peso: 10 },
  { indice: 4, peso: 6 },
  { indice: 5, peso: 6 },
  { indice: 6, peso: 5 },
  { indice: 7, peso: 3 },
]

function sortearResultado() {
  if (import.meta.env.DEV && window.__forcarRoleta !== undefined) {
    const forcado = window.__forcarRoleta
    window.__forcarRoleta = undefined
    return forcado === 'nearMiss' ? { nearMiss: true } : { indice: forcado }
  }
  const total = SORTEIO.reduce((soma, opcao) => soma + opcao.peso, 0)
  let alvo = Math.random() * total
  for (const opcao of SORTEIO) {
    alvo -= opcao.peso
    if (alvo <= 0) return opcao
  }
  return SORTEIO[1]
}

// posição da roda (em graus da roda) que precisa parar sob o ponteiro
function posicaoFinal(resultado) {
  if (resultado.nearMiss) {
    // o ponteiro varre posições em ordem decrescente: atravessa TODA a fatia do
    // jackpot [0,10) rastejando e morre 2-4° dentro da vizinha "+1 GIRO" [335,360)
    return 360 - (2 + Math.random() * 2)
  }
  const fatia = FATIAS[resultado.indice]
  const inicio = INICIOS[resultado.indice]
  return inicio + fatia.graus * (0.15 + Math.random() * 0.7)
}

function caminhoFatia(inicio, graus) {
  const a0 = ((inicio - 90) * Math.PI) / 180
  const a1 = ((inicio + graus - 90) * Math.PI) / 180
  const raio = 100
  const arcoGrande = graus > 180 ? 1 : 0
  return [
    'M 0 0',
    `L ${raio * Math.cos(a0)} ${raio * Math.sin(a0)}`,
    `A ${raio} ${raio} 0 ${arcoGrande} 1 ${raio * Math.cos(a1)} ${raio * Math.sin(a1)}`,
    'Z',
  ].join(' ')
}

function fatiaSobPonteiro(rotacao) {
  const posicao = ((360 - (rotacao % 360)) + 360) % 360
  return FATIAS.findIndex((_, i) => posicao >= INICIOS[i] && posicao < INICIOS[i] + FATIAS[i].graus)
}

export default function RoletaDoNada({ padrao = 'roleta-near-miss' }) {
  const [rotacao, setRotacao] = useState(0)
  const [girando, setGirando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const rotacaoRef = useRef(0)
  const quadroRef = useRef(null)

  const girosDisponiveis = useRoletaStore((estado) => estado.girosDisponiveis())
  const consumirGiro = useRoletaStore((estado) => estado.consumirGiro)
  const ganharGiroExtra = useRoletaStore((estado) => estado.ganharGiroExtra)
  const ganharMoedas = useMoedasStore((estado) => estado.ganhar)
  const aplicarCupom = useCarrinhoStore((estado) => estado.aplicarCupom)

  function aplicarPremio(sorteio) {
    const fatia = sorteio.nearMiss ? FATIAS[7] : FATIAS[sorteio.indice]
    if (fatia.tipo === 'moedas') {
      ganharMoedas(fatia.valor, 'Prêmio da roleta')
      tocarSomMoeda()
    }
    if (fatia.tipo === 'cupom') aplicarCupom(fatia.codigo)
    if (fatia.tipo === 'giroExtra') ganharGiroExtra()
    return fatia
  }

  function girar() {
    if (girando || !consumirGiro()) return
    setResultado(null)
    setGirando(true)

    const sorteio = sortearResultado()
    const posicao = posicaoFinal(sorteio)
    const nearMiss = Boolean(sorteio.nearMiss)

    const partida = rotacaoRef.current
    const faltaPraPosicao = (360 - posicao - (partida % 360) + 720) % 360
    const destino = partida + 360 * 5 + faltaPraPosicao

    const duracao = (import.meta.env.DEV && window.__duracaoRoleta) || (nearMiss ? 7000 : 5000)
    // cauda mais longa no near-miss: os últimos ~10° levam uns 2,5s — é aí que a
    // roleta atravessa o jackpot rastejando
    const expoente = nearMiss ? 5 : 4

    const inicio = performance.now()
    let ultimaFatia = fatiaSobPonteiro(partida)

    function passo(agora) {
      const progresso = Math.min(1, (agora - inicio) / duracao)
      const suave = 1 - (1 - progresso) ** expoente
      const atual = partida + (destino - partida) * suave
      rotacaoRef.current = atual
      setRotacao(atual)

      const fatiaAtual = fatiaSobPonteiro(atual)
      if (fatiaAtual !== ultimaFatia) {
        ultimaFatia = fatiaAtual
        tocarTique()
        navigator.vibrate?.(8)
      }

      if (progresso < 1) {
        quadroRef.current = requestAnimationFrame(passo)
      } else {
        navigator.vibrate?.([60, 40, 120])
        const fatia = aplicarPremio(sorteio)
        setResultado({ fatia, nearMiss })
        setGirando(false)
      }
    }
    quadroRef.current = requestAnimationFrame(passo)
  }

  return (
    <div data-padrao={padrao} className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* ponteiro */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-2"
          style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '22px solid var(--color-tinta)' }}
        />
        <svg
          viewBox="-104 -104 208 208"
          className="h-72 w-72"
          role="img"
          aria-label="Roleta de prêmios"
          style={{ transform: `rotate(${rotacao}deg)` }}
        >
          {FATIAS.map((fatia, i) => (
            <g key={fatia.rotulo}>
              <path
                d={caminhoFatia(INICIOS[i], fatia.graus)}
                fill={fatia.cor}
                stroke="var(--color-tinta)"
                strokeWidth="1"
                className={fatia.tipo === 'jackpot' ? 'animate-pulse' : ''}
              />
              <g transform={`rotate(${INICIOS[i] + fatia.graus / 2})`}>
                <text
                  transform={`translate(0 -${Math.max(48, 90 - fatia.rotulo.length * 3.5)}) rotate(180)`}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="Anton, sans-serif"
                  fill={fatia.texto}
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {fatia.rotulo}
                </text>
              </g>
            </g>
          ))}
          <circle r="18" fill="var(--color-tinta)" />
          <text textAnchor="middle" dy="4" fontSize="10" fontFamily="Anton, sans-serif" fill="var(--color-amarelo)">
            NADA
          </text>
        </svg>
      </div>

      <button
        type="button"
        onClick={girar}
        disabled={girando || girosDisponiveis === 0}
        className="hard-shadow bg-vermelho px-10 py-3 font-display text-xl text-white disabled:opacity-40 disabled:shadow-none"
      >
        {girando ? 'GIRANDO...' : 'GIRAR'}
      </button>

      {resultado && (
        <div
          role="status"
          className={`hard-shadow max-w-72 border p-4 text-center ${
            resultado.nearMiss ? '-rotate-2 border-vermelho bg-amarelo/20' : 'border-tinta/10 bg-white'
          }`}
        >
          {resultado.nearMiss ? (
            <>
              <p className="font-display text-xl text-vermelho">FOI POR UM FIO!!</p>
              <p className="mt-1 text-sm text-tinta">
                O R$ 500 passou <span className="font-display">RASPANDO</span>... mas você ganhou{' '}
                <span className="font-display">+1 GIRO</span>. Tenta de novo, dessa vez vai!
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-xl text-laranja">VOCÊ GANHOU!</p>
              <p className="mt-1 text-sm text-tinta">
                <span className="font-display">{resultado.fatia.rotulo}</span>
                {resultado.fatia.tipo === 'cupom' && ' — já aplicado no seu carrinho'}
                {resultado.fatia.tipo === 'frete' && ' — que, sendo justo, já era grátis'}
                {resultado.fatia.tipo === 'moedas' && ' na sua carteira'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
