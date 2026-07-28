import { useState, useRef, useEffect } from 'react'
import { useCarrinhoStore } from '../../store/useCarrinhoStore'

// o vendedor é um bot de pechincha: sempre baixa o preço, sempre alega
// prejuízo, sempre fecha. 12 mensagens de limite. o cupom que ele concede
// vale de verdade no carrinho. o efeito de digitação mascara a latência.
function textoInicial(produto) {
  return `Olá amigo!! Seja bem vindo a loja!! Interessado no ${produto}?? Tenho preço especial!! 🔥`
}

export default function ChatVendedor({ produto, aoFechar, padrao = 'acao-forcada' }) {
  const [mensagens, setMensagens] = useState(() => [
    { role: 'assistant', content: textoInicial(produto.titulo.slice(0, 40)) },
  ])
  const [entrada, setEntrada] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [cupomAplicado, setCupomAplicado] = useState(false)
  const ultimoRef = useRef(null)
  const aplicarCupom = useCarrinhoStore((s) => s.aplicarCupom)

  useEffect(() => {
    ultimoRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function enviar() {
    const texto = entrada.trim()
    if (!texto || carregando || mensagens.length >= 12) return

    const novaMensagens = [...mensagens, { role: 'user', content: texto }]
    setMensagens(novaMensagens)
    setEntrada('')
    setCarregando(true)

    try {
      const resposta = await fetch('/api/vendedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historico: novaMensagens,
          produto: produto.titulo,
        }),
      })

      const dados = await resposta.json()

      if (dados.cupom && !cupomAplicado) {
        aplicarCupom(dados.cupom)
        setCupomAplicado(true)
      }

      // efeito de digitação: revela caractere por caractere
      setMensagens((atual) => [...atual, { role: 'assistant', content: '' }])
      const respostaFinal = dados.resposta
      for (let i = 1; i <= respostaFinal.length; i++) {
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 20))
        setMensagens((atual) => {
          const copia = [...atual]
          copia[copia.length - 1] = { role: 'assistant', content: respostaFinal.slice(0, i) }
          return copia
        })
      }
    } catch {
      setMensagens((atual) => [
        ...atual,
        { role: 'assistant', content: 'Amigo!! Conexão caiu!! Tenta de novo!! 📡' },
      ])
    } finally {
      setCarregando(false)
    }
  }

  function handleTecla(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div
      data-padrao={padrao}
      className="fixed inset-0 z-50 flex flex-col bg-fundo"
      role="dialog"
      aria-label="Chat com o vendedor"
    >
      {/* cabeçalho */}
      <div className="flex items-center justify-between bg-laranja px-3 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-laranja">
            VS
          </span>
          <div>
            <p className="font-display text-sm">VENDEDOR OFICIAL</p>
            <p className="text-[10px] text-white/60">Online · Responde em segundos</p>
          </div>
        </div>
        <button
          type="button"
          onClick={aoFechar}
          className="text-lg text-white/80 hover:text-white"
          aria-label="Fechar chat"
        >
          ✕
        </button>
      </div>

      {/* mensagens */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {mensagens.map((msg, i) => (
            <div
              key={i}
              ref={i === mensagens.length - 1 ? ultimoRef : undefined}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`hard-shadow max-w-[85%] px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-laranja text-white'
                    : 'bg-white text-tinta'
                }`}
              >
                {msg.content}
                {i === mensagens.length - 1 && carregando && (
                  <span className="ml-1 animate-pulse">▌</span>
                )}
              </div>
            </div>
          ))}

          {mensagens.length >= 12 && (
            <p className="text-center text-xs text-tinta/30">Conversa encerrada. Cupom aplicado no carrinho.</p>
          )}
        </div>
      </div>

      {/* vaquinha de prejuízo */}
      <div className="bg-vermelho/5 px-3 py-1 text-center text-[11px] text-vermelho/60">
        Este vendedor está operando no prejuízo há 47 dias seguidos
      </div>

      {/* entrada */}
      <div className="border-t border-tinta/10 bg-white p-3">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            type="text"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={handleTecla}
            disabled={carregando || mensagens.length >= 12}
            placeholder={mensagens.length >= 12 ? 'Conversa encerrada' : 'Quero desconto, amigo...'}
            className="flex-1 border border-tinta/20 px-3 py-2 text-sm text-tinta placeholder:text-tinta/30 focus:outline-none disabled:bg-tinta/5"
          />
          <button
            type="button"
            onClick={enviar}
            disabled={carregando || mensagens.length >= 12 || !entrada.trim()}
            className="hard-shadow bg-laranja px-4 py-2 font-display text-sm text-white disabled:opacity-40 disabled:shadow-none"
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  )
}
