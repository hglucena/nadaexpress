import { useState, useRef } from 'react'
import { urlImagem, urlImagemRemota, svgFallback } from '../../lib/gerar-imagem'

export default function ImagemProduto({ id, termo, alt = '', className = '' }) {
  const [fase, setFase] = useState(0) // 0=local, 1=remoto, 2=fallback
  const [pronto, setPronto] = useState(false)
  const tentouRemoto = useRef(false)

  const src =
    fase === 0 ? urlImagem(id) :
    fase === 1 && termo ? urlImagemRemota(id, termo) :
    svgFallback(termo || '')

  function aoErro() {
    if (fase === 0 && !tentouRemoto.current && termo) {
      tentouRemoto.current = true
      setFase(1)
      setPronto(false)
    } else {
      setFase(2)
      setPronto(true)
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!pronto && (
        <div className="absolute inset-0 animate-pulse bg-tinta/5" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setPronto(true)}
        onError={aoErro}
        className={`h-full w-full object-cover transition-opacity duration-500 ${pronto ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
