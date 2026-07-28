import { useEffect, useState } from 'react'

// contador que começa em 8 e sobe sozinho enquanto a pessoa lê a página.
// prova social fabricada: números reais de tráfego são invisíveis, mas
// um número subindo diante dos olhos cria pressão de "vão levar antes de mim".
export default function PessoasVendo({ padrao = 'prova-social' }) {
  const [contagem, setContagem] = useState(() => 8 + Math.floor(Math.random() * 5))

  useEffect(() => {
    function agendar() {
      return setTimeout(() => {
        setContagem((atual) => atual + (Math.random() < 0.4 ? 2 : 1))
        agendar()
      }, 3000 + Math.random() * 4000)
    }
    const timer = agendar()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div data-padrao={padrao} className="inline-flex items-center gap-1 text-xs text-tinta/60">
      <span aria-hidden="true" className="animate-pulse text-laranja">
        ●
      </span>
      <span>{contagem} pessoas estão vendo isso agora</span>
    </div>
  )
}
