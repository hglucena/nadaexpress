import { useEffect, useState } from 'react'
import reviewsOffline from '../data/fallback/reviews'
import { amostrarReviews } from '../lib/amostrarReviews'
import { modoOffline } from '../lib/config'

const cachePorProduto = new Map()

export function useReviews(produto) {
  const [estado, setEstado] = useState(() => {
    if (!produto?.id) return { carregando: false, reviews: [] }
    const emCache = cachePorProduto.get(produto.id)
    return emCache ? { carregando: false, reviews: emCache } : { carregando: true, reviews: null }
  })

  useEffect(() => {
    if (!produto?.id) return

    const emCache = cachePorProduto.get(produto.id)
    if (emCache) {
      setEstado({ carregando: false, reviews: emCache })
      return
    }

    let cancelado = false
    setEstado({ carregando: true, reviews: null })

    function concluir(reviews) {
      if (cancelado) return
      cachePorProduto.set(produto.id, reviews)
      setEstado({ carregando: false, reviews })
    }

    if (modoOffline()) {
      // atraso de mentira pro skeleton aparecer como no modo com rede
      const atraso = setTimeout(() => concluir(amostrarReviews(reviewsOffline, produto.id)), 300 + Math.random() * 400)
      return () => {
        cancelado = true
        clearTimeout(atraso)
      }
    }

    fetch('/api/gerar-reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ titulo: produto.titulo, categoria: produto.categoria }),
    })
      .then((resposta) => {
        if (!resposta.ok) throw new Error('falha ao gerar reviews')
        return resposta.json()
      })
      .then((dados) => concluir(dados.reviews))
      .catch(() => concluir(amostrarReviews(reviewsOffline, produto.id)))

    return () => {
      cancelado = true
    }
  }, [produto?.id, produto?.titulo, produto?.categoria])

  return estado
}
