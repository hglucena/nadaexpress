import { useCallback, useEffect, useRef, useState } from 'react'
import { produtosMock } from '../data/mock-produtos'
import produtosOffline from '../data/fallback/produtos'
import { modoOffline } from '../lib/config'
import { criarRng, hashDeString, embaralhar } from '../lib/aleatorio'

const TAMANHO_PAGINA = 8
const CHAVE_SESSAO = 'nadaexpress-produtos-gerados'
const CATEGORIAS_CICLO = ['Eletrônicos', 'Casa', 'Cozinha', 'Pet', 'Beleza', 'Ferramentas', 'Moda', 'Brinquedos', 'Fitness']

function lerCache() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO)
    return bruto ? JSON.parse(bruto) : []
  } catch {
    return []
  }
}

function salvarCache(produtos) {
  try {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(produtos))
  } catch {
    // sessionStorage indisponível (modo privado, cheio) — segue sem cache, não é crítico
  }
}

function paginaFallback(indice) {
  const inicio = (indice * TAMANHO_PAGINA) % produtosMock.length
  return Array.from({ length: TAMANHO_PAGINA }, (_, i) => {
    const original = produtosMock[(inicio + i) % produtosMock.length]
    return { ...original, id: `scroll-fallback-${Date.now()}-${i}` }
  })
}

async function buscarPagina(categoria) {
  const resposta = await fetch('/api/gerar-produtos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ categoria, quantidade: TAMANHO_PAGINA }),
  })
  if (!resposta.ok) throw new Error('falha ao gerar produtos')
  const dados = await resposta.json()
  return dados.produtos
}

// modo offline: serve o dataset estático embaralhado por sessão, sem rede.
// jaTem = quantos itens offline já entregou (o cursor); repete com id sufixado
// quando o dataset esgota — feed infinito de verdade repete mesmo.
function paginaOffline(categoria, jaTem) {
  const ordem = embaralhar(criarRng(hashDeString(`offline-${categoria ?? 'tudo'}`)), produtosOffline)
  const base = categoria ? ordem.filter((produto) => produto.categoria === categoria) : ordem
  if (base.length === 0) return []
  return Array.from({ length: TAMANHO_PAGINA }, (_, i) => {
    const indice = jaTem + i
    const produto = base[indice % base.length]
    const volta = Math.floor(indice / base.length)
    return volta === 0 ? produto : { ...produto, id: `${produto.id}#${volta}` }
  })
}

function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

// scroll infinito: quando o sentinela some perto do fim da lista, busca DUAS páginas de
// uma vez (16 produtos) — isso é o "buffer de 2 páginas": dá fôlego pra rolar bastante
// antes de precisar de outra leva, mesmo com a geração real levando alguns segundos.
export function useProdutosInfinitos({ categoria, termo }) {
  const [extras, setExtras] = useState(lerCache)
  const [carregando, setCarregando] = useState(false)
  const sentinelaRef = useRef(null)
  const buscandoRef = useRef(false)
  const indiceCategoriaRef = useRef(0)

  const proximaCategoria = useCallback(() => {
    if (categoria) return categoria
    const escolhida = CATEGORIAS_CICLO[indiceCategoriaRef.current % CATEGORIAS_CICLO.length]
    indiceCategoriaRef.current += 1
    return escolhida
  }, [categoria])

  const buscarMais = useCallback(async () => {
    if (buscandoRef.current || termo.trim() !== '') return
    buscandoRef.current = true
    setCarregando(true)

    try {
      if (modoOffline()) {
        // atraso curto de mentira: skeleton aparece e a troca fica indistinguível da rede
        await esperar(350 + Math.random() * 450)
        setExtras((atual) => {
          const cursor = atual.filter((produto) => String(produto.id).startsWith('off-')).length
          const novo = [...atual, ...paginaOffline(categoria, cursor)]
          salvarCache(novo)
          return novo
        })
        return
      }

      const paginas = await Promise.all([
        buscarPagina(proximaCategoria()).catch(() => null),
        buscarPagina(proximaCategoria()).catch(() => null),
      ])

      const geradas = paginas.flatMap((pagina, indice) => pagina ?? paginaFallback(indice))

      setExtras((atual) => {
        const novo = [...atual, ...geradas]
        salvarCache(novo)
        return novo
      })
    } finally {
      buscandoRef.current = false
      setCarregando(false)
    }
  }, [proximaCategoria, termo, categoria])

  useEffect(() => {
    const sentinela = sentinelaRef.current
    if (!sentinela) return

    const observer = new IntersectionObserver((entradas) => entradas[0].isIntersecting && buscarMais(), {
      rootMargin: '600px',
    })
    observer.observe(sentinela)
    return () => observer.disconnect()
  }, [buscarMais])

  useEffect(() => {
    if (import.meta.env.DEV) window.__buscarMaisDebug = buscarMais
  }, [buscarMais])

  return { produtosExtras: extras, sentinelaRef, carregandoMais: carregando }
}
