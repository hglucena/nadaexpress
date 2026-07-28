import { Link } from 'react-router-dom'
import CaixaMisteriosa from '../components/gamificacao/CaixaMisteriosa'
import ContadorMoedas from '../components/gamificacao/ContadorMoedas'
import { useCaixaStore } from '../store/useCaixaStore'

export default function CaixaMisteriosaPage() {
  const historico = useCaixaStore((s) => s.historico)

  return (
    <div>
      <div className="flex items-center justify-between bg-white p-2 text-sm">
        <Link to="/">← voltar</Link>
        <ContadorMoedas escuro />
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-8 md:py-12">
        <h1 className="font-display text-3xl text-laranja md:text-5xl">
          CAIXA MISTERIOSA
        </h1>
        <p className="text-sm text-tinta/70 md:text-base">
          1 caixa grátis por dia. O que tem dentro? Nem a gente sabe direito.
        </p>

        <div className="mt-4 md:mt-8">
          <CaixaMisteriosa />
        </div>

        {historico.length > 0 && (
          <div className="mt-8 w-full max-w-sm">
            <h2 className="mb-3 text-center font-display text-sm text-tinta/30">
              HISTÓRICO DE ABERTURAS
            </h2>
            <div className="space-y-2">
              {historico.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border border-tinta/10 bg-white px-3 py-2 text-sm"
                >
                  <span className="text-tinta/50">{h.data}</span>
                  <span className="font-display text-tinta">
                    {h.tipo === 'moedas'
                      ? `${h.valor} moeda${h.valor > 1 ? 's' : ''}`
                      : `CUPOM ${h.valor}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          to="/roleta"
          className="mt-4 text-sm text-tinta/40 underline md:text-base"
        >
          Quer mais prêmios? Vai pra roleta.
        </Link>
      </div>
    </div>
  )
}
