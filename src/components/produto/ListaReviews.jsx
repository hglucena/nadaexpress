export default function ListaReviews({ reviews, carregando }) {
  if (carregando) {
    return (
      <div className="flex flex-col gap-3 p-3">
        {[0, 1, 2].map((indice) => (
          <div key={indice} className="animate-pulse border-t border-tinta/10 pt-3">
            <div className="h-3 w-24 bg-tinta/10" />
            <div className="mt-2 h-3 w-full bg-tinta/10" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3 p-3">
      {reviews.map((review) => (
        <li key={review.id} className="border-t border-tinta/10 pt-3 text-sm">
          <div className="flex items-center gap-2 text-tinta/60">
            <span>{review.nome}</span>
            <span aria-hidden="true" className="text-amarelo">
              {'★'.repeat(review.nota)}
              <span className="text-tinta/20">{'★'.repeat(5 - review.nota)}</span>
            </span>
            <span>{review.data}</span>
          </div>
          <p className="mt-1 text-tinta">{review.texto}</p>
        </li>
      ))}
    </ul>
  )
}
