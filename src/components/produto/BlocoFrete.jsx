export default function BlocoFrete() {
  return (
    <div className="mx-3 flex items-start gap-2 border border-tinta/10 bg-white p-3 text-sm">
      <span aria-hidden="true">🚚</span>
      <div>
        <p className="text-tinta">
          Frete <span className="text-laranja">grátis</span> para João Pessoa
        </p>
        <p className="text-tinta/60">Chega em 45 a 90 dias úteis</p>
      </div>
    </div>
  )
}
