import { useEffect, useState, useCallback } from 'react'

const NOMES = [
  'M***a S***a',
  'J***e P***a',
  'C***s L***a',
  'A***a M***s',
  'R***l F***a',
  'L***a O***a',
  'P***o N***s',
  'G***a T***a',
  'D***s C***o',
  'F***a R***s',
]

const CIDADES = [
  'João Pessoa',
  'Recife',
  'Campina Grande',
  'Natal',
  'Maceió',
  'Fortaleza',
  'Salvador',
]

const COMPRAS = [
  'acabou de comprar este item',
  'acaba de levar 2 unidades',
  'finalizou a compra agorinha',
  'garantiu o último do estoque',
  'comprou com frete grátis',
  'acabou de aplicar o cupom de 10%',
]

function sorteio(lista) {
  return lista[Math.floor(Math.random() * lista.length)]
}

export default function NotificacaoFantasma({ padrao = 'prova-social' }) {
  const [visivel, setVisivel] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [saindo, setSaindo] = useState(false)

  const mostrar = useCallback(() => {
    const nome = sorteio(NOMES)
    const cidade = sorteio(CIDADES)
    const acao = sorteio(COMPRAS)
    setMensagem(`${nome}, ${cidade} — ${acao}`)
    setSaindo(false)
    setVisivel(true)

    setTimeout(() => setSaindo(true), 4500)
    setTimeout(() => setVisivel(false), 5000)
  }, [])

  useEffect(() => {
    function agendar() {
      return setTimeout(
        () => {
          mostrar()
          agendar()
        },
        20000 + Math.random() * 20000
      )
    }
    // primeira aparição mais rápida: 5-12s
    const inicio = setTimeout(() => {
      mostrar()
      const loop = agendar()
      return () => clearTimeout(loop)
    }, 5000 + Math.random() * 7000)

    return () => clearTimeout(inicio)
  }, [mostrar])

  if (!visivel) return null

  return (
    <div
      data-padrao={padrao}
      role="status"
      aria-live="polite"
      className={`hard-shadow fixed bottom-5 left-3 z-50 max-w-56 bg-tinta px-3 py-2 text-xs text-amarelo transition-all duration-500 ${
        saindo ? 'translate-x-[-120%] opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <span className="mr-1">📦</span>
      {mensagem}
    </div>
  )
}
