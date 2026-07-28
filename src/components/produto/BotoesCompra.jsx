import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'

export default function BotoesCompra({ produto, cor, tamanho }) {
  const adicionarItem = useCarrinhoStore((estado) => estado.adicionarItem)
  const [adicionado, setAdicionado] = useState(false)
  const navigate = useNavigate()

  function handleAdicionar() {
    adicionarItem(produto, { cor, tamanho, quantidade: 1 })
    setAdicionado(true)
    setTimeout(() => setAdicionado(false), 1500)
  }

  function handleComprarAgora() {
    adicionarItem(produto, { cor, tamanho, quantidade: 1 })
    navigate('/checkout')
  }

  return (
    <div className="flex gap-2 p-3">
      <button
        type="button"
        onClick={handleAdicionar}
        className="flex-1 border border-laranja py-2 font-display text-laranja"
      >
        {adicionado ? 'ADICIONADO ✓' : 'ADICIONAR AO CARRINHO'}
      </button>
      <button
        type="button"
        onClick={handleComprarAgora}
        className="hard-shadow flex-1 bg-laranja py-2 font-display text-white"
      >
        COMPRAR AGORA
      </button>
    </div>
  )
}
