export const reviewsMock = [
  { id: 1, nome: 'r***o', nota: 5, data: 'há 2 dias', texto: 'Produto muito bom, chegou rápido, recomendo a todos!!' },
  { id: 2, nome: 'm***a', nota: 5, data: 'há 1 semana', texto: 'Excelente custo benefício, superou minhas expectativas.' },
  { id: 3, nome: 'j***s', nota: 2, data: 'há 3 dias', texto: 'Demorou muito pra chegar, quase 2 meses de espera.' },
  { id: 4, nome: 'a***o', nota: 4, data: 'há 5 dias', texto: 'Bom produto mas veio a cor diferente do anúncio site.' },
  { id: 5, nome: 'c***a', nota: 5, data: 'há 2 semanas', texto: 'A entrega foi rápida e o vendedor muito atencioso, obrigado.' },
  { id: 6, nome: 'p***r', nota: 1, data: 'há 4 dias', texto: 'Não recomendo, veio quebrado e sem embalagem adequada.' },
]

const DISTRIBUICAO_PERCENTUAL = [68, 18, 7, 4, 3]

export function distribuicaoNotas(vendidos) {
  const totalAvaliacoes = Math.min(999, Math.max(5, Math.round(vendidos * 0.02)))
  return DISTRIBUICAO_PERCENTUAL.map((percentual, indice) => ({
    estrelas: 5 - indice,
    percentual,
    quantidade: Math.round((totalAvaliacoes * percentual) / 100),
  }))
}
