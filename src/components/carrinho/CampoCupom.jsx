import { useState } from 'react'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'

export default function CampoCupom() {
  const cupom = useCarrinhoStore((estado) => estado.cupom)
  const aplicarCupom = useCarrinhoStore((estado) => estado.aplicarCupom)
  const removerCupom = useCarrinhoStore((estado) => estado.removerCupom)
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState(false)

  function handleAplicar(evento) {
    evento.preventDefault()
    if (!codigo.trim()) return
    const sucesso = aplicarCupom(codigo)
    setErro(!sucesso)
    if (sucesso) setCodigo('')
  }

  if (cupom) {
    return (
      <div className="flex items-center justify-between p-3 text-sm">
        <span className="text-laranja">Cupom {cupom.codigo} aplicado</span>
        <button type="button" onClick={removerCupom} className="text-tinta/50 underline">
          remover
        </button>
      </div>
    )
  }

  return (
    <div className="p-3">
      <form onSubmit={handleAplicar} className="flex gap-2">
        <input
          type="text"
          value={codigo}
          onChange={(evento) => {
            setCodigo(evento.target.value)
            setErro(false)
          }}
          placeholder="Código de cupom"
          aria-label="Código de cupom"
          className="flex-1 border border-tinta/20 px-2 py-1 text-sm uppercase focus:outline-none"
        />
        <button type="submit" className="border border-laranja px-3 text-sm text-laranja">
          Aplicar
        </button>
      </form>
      {erro && <p className="mt-1 text-xs text-vermelho">Cupom inválido</p>}
    </div>
  )
}
