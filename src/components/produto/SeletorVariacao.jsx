export const CORES = ['Preto', 'Branco', 'Azul', 'Rosa']
export const TAMANHOS = ['P', 'M', 'G', 'GG']

export default function SeletorVariacao({ cor, tamanho, onMudarCor, onMudarTamanho }) {
  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      <div>
        <p className="mb-1 text-tinta/60">Cor: {cor}</p>
        <div className="flex gap-2">
          {CORES.map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => onMudarCor(opcao)}
              aria-pressed={opcao === cor}
              className={`border px-3 py-1 ${
                opcao === cor ? 'border-laranja text-laranja' : 'border-tinta/20 text-tinta/70'
              }`}
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-tinta/60">Tamanho: {tamanho}</p>
        <div className="flex gap-2">
          {TAMANHOS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => onMudarTamanho(opcao)}
              aria-pressed={opcao === tamanho}
              className={`border px-3 py-1 ${
                opcao === tamanho ? 'border-laranja text-laranja' : 'border-tinta/20 text-tinta/70'
              }`}
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
