import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const banners = [
  { texto: 'FESTIVAL DO NADA — ATÉ 90% OFF', cor: 'bg-laranja' },
  { texto: 'GIRE A ROLETA E GANHE CUPOM', cor: 'bg-rosa', rota: '/roleta' },
  { texto: 'FRETE GRÁTIS PARA JOÃO PESSOA', cor: 'bg-vermelho' },
  { texto: 'NOVO POR AQUI? GANHE R$ 50 EM NADACOINS', cor: 'bg-amarelo' },
]

export default function CarrosselBanners() {
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((atual) => (atual + 1) % banners.length)
    }, 4000)
    return () => clearInterval(intervalo)
  }, [])

  const banner = banners[indice]

  const conteudo = <p className="font-display text-xl text-white text-shadow-sm">{banner.texto}</p>

  return (
    <div className={`relative flex h-28 items-center justify-center px-4 text-center ${banner.cor}`}>
      {banner.rota ? (
        <Link to={banner.rota} className="flex h-full w-full items-center justify-center">
          {conteudo}
        </Link>
      ) : (
        conteudo
      )}

      <button
        type="button"
        aria-label="Banner anterior"
        onClick={() => setIndice((atual) => (atual - 1 + banners.length) % banners.length)}
        className="absolute left-1 top-1/2 -translate-y-1/2 px-2 py-1 text-white/80"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Próximo banner"
        onClick={() => setIndice((atual) => (atual + 1) % banners.length)}
        className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-white/80"
      >
        ›
      </button>

      <div className="absolute bottom-2 flex w-full justify-center gap-1.5">
        {banners.map((item, posicao) => (
          <button
            key={item.texto}
            type="button"
            aria-label={`Ir para banner ${posicao + 1}`}
            onClick={() => setIndice(posicao)}
            className={`h-1.5 w-1.5 rounded-full ${posicao === indice ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}
