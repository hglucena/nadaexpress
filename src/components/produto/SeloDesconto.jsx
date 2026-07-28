export default function SeloDesconto({ porcentagem }) {
  return (
    <span className="hard-shadow -rotate-3 inline-block bg-vermelho px-1.5 py-0.5 font-display text-xs text-white">
      -{porcentagem}%
    </span>
  )
}
