import { categorias } from '../../data/mock-produtos'

export default function LinhaCategorias({ selecionada, onSelecionar }) {
  return (
    <div className="flex gap-4 overflow-x-auto bg-white px-3 py-2">
      {categorias.map((categoria) => {
        const ativa = categoria.nome === selecionada
        return (
          <button
            key={categoria.nome}
            type="button"
            onClick={() => onSelecionar(ativa ? null : categoria.nome)}
            className={`flex shrink-0 flex-col items-center gap-1 text-[11px] ${
              ativa ? 'text-laranja' : 'text-tinta/70'
            }`}
          >
            <span className="text-xl">{categoria.icone}</span>
            {categoria.nome}
          </button>
        )
      })}
    </div>
  )
}
