import { useEffect, useState } from 'react'

function paraHMS(segundosTotais) {
  const h = Math.floor(segundosTotais / 3600)
  const m = Math.floor((segundosTotais % 3600) / 60)
  const s = segundosTotais % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

// contador que nunca chega a zero de verdade: ao zerar, reinicia em silêncio.
// a urgência é falsa, mas o efeito psicológico de "agora ou nunca" é real — por isso funciona.
export default function ContadorRegressivo({ duracaoHoras = 4, padrao = 'urgencia-falsa' }) {
  const [segundos, setSegundos] = useState(duracaoHoras * 3600)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundos((atual) => (atual <= 1 ? duracaoHoras * 3600 : atual - 1))
    }, 1000)
    return () => clearInterval(intervalo)
  }, [duracaoHoras])

  return (
    <div
      data-padrao={padrao}
      className="inline-flex items-center gap-2 bg-tinta px-2 py-1 text-xs text-amarelo"
    >
      <span>OFERTA TERMINA EM</span>
      <span className="font-display tabular-nums">{paraHMS(segundos)}</span>
    </div>
  )
}
