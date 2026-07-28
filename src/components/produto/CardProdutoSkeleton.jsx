export default function CardProdutoSkeleton() {
  return (
    <div className="flex animate-pulse flex-col border border-tinta/10 bg-white">
      <div className="aspect-square bg-tinta/10" />
      <div className="flex flex-col gap-2 p-2">
        <div className="h-3 w-full bg-tinta/10" />
        <div className="h-3 w-2/3 bg-tinta/10" />
        <div className="h-5 w-1/2 bg-tinta/10" />
      </div>
    </div>
  )
}
