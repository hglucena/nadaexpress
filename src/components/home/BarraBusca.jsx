export default function BarraBusca({ valor, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white px-3 py-2">
      <span aria-hidden="true">🔍</span>
      <input
        type="search"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder="Buscar produto que não vai chegar"
        aria-label="Buscar produto"
        className="w-full bg-transparent text-sm text-tinta placeholder:text-tinta/40 focus:outline-none"
      />
    </div>
  )
}
