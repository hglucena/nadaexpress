import { useMemo } from 'react'

function hashId(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

// número fixo por produto nesta sessão — mesma página gera o mesmo valor sempre.
// a escassez é inventada, mas consistente: se voltar daqui a 5 min, continua 2.
export default function EstoqueBaixo({ idProduto, padrao = 'escassez-falsa' }) {
  const estoque = useMemo(() => {
    if (!idProduto) return 2
    const chave = `nbx-estoque-${idProduto}`
    const cache = sessionStorage.getItem(chave)
    if (cache) return Number(cache)
    const valor = (hashId(idProduto) % 4) + 1
    sessionStorage.setItem(chave, String(valor))
    return valor
  }, [idProduto])

  return (
    <div
      data-padrao={padrao}
      className="inline-flex animate-pulse items-center gap-1 bg-vermelho/10 px-2 py-0.5 text-xs font-semibold text-vermelho"
    >
      <span aria-hidden="true">🔥</span>
      <span>
        {estoque <= 1
          ? 'ÚLTIMA UNIDADE!'
          : `Só restam ${estoque} unidades!`}
      </span>
    </div>
  )
}
