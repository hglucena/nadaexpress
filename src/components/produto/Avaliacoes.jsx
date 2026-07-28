import { distribuicaoNotas } from '../../data/mock-reviews'

export default function Avaliacoes({ nota, vendidos }) {
  const distribuicao = distribuicaoNotas(vendidos)
  const totalAvaliacoes = distribuicao.reduce((soma, linha) => soma + linha.quantidade, 0)
  const notaArredondada = Math.round(nota)

  return (
    <div className="flex gap-6 p-3">
      <div className="shrink-0 text-center">
        <p className="font-display text-4xl text-tinta">{nota.toFixed(1)}</p>
        <p className="text-amarelo" aria-hidden="true">
          {'★'.repeat(notaArredondada)}
          <span className="text-tinta/20">{'★'.repeat(5 - notaArredondada)}</span>
        </p>
        <p className="text-xs text-tinta/60">{totalAvaliacoes} avaliações</p>
      </div>
      <div className="flex-1 self-center">
        {distribuicao.map((linha) => (
          <div key={linha.estrelas} className="flex items-center gap-2 text-xs text-tinta/70">
            <span className="w-8 shrink-0">{linha.estrelas}★</span>
            <div className="h-2 flex-1 bg-tinta/10">
              <div className="h-2 bg-amarelo" style={{ width: `${linha.percentual}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right">{linha.quantidade}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
