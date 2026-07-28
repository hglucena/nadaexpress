import { useEffect, useState } from 'react'

// rastreio narrativo: o pacote sai de Shenzhen e nunca chega. cada evento
// empurra a estimativa de entrega mais pra frente. a saga é gerada a partir
// do número do pedido (determinístico) e um evento novo aparece a cada visita.
// texto em português truncado de sistema logístico de verdade.
const EVENTOS_PADRAO = [
  { local: 'Shenzhen-Yantian, CN', descricao: 'Objeto postado pelo remetente. Aguardando triagem.' },
  { local: 'Shenzhen, CN', descricao: 'Encomenda em trânsito. Encaminhado para centro de distribuição internacional.' },
  { local: 'Guangzhou, CN', descricao: 'Saída do centro internacional. Próxima parada: país de destino.' },
  { local: 'Curitiba, BR', descricao: 'Chegada no Brasil. Aguardando fiscalização aduaneira. Prazo: 7 dias úteis.' },
  { local: 'Curitiba, BR', descricao: 'Em fiscalização. Documentação complementar solicitada ao remetente.' },
  { local: 'Curitiba, BR', descricao: 'Desembaraço concluído. Encaminhado para centro logístico regional.' },
  { local: 'São Paulo, BR', descricao: 'Recebido em centro de distribuição. Triagem em andamento.' },
  { local: 'Recife, BR', descricao: 'DESVIO DE ROTA — Objeto redirecionado. Motivo: inconsistência no CEP de origem.' },
  { local: 'Cajamar, BR', descricao: 'Retornou ao centro de distribuição. Nova triagem iniciada. Prazo alterado.' },
  { local: 'Fortaleza, BR', descricao: 'Saiu para entrega. Aguardando confirmação do destinatário.' },
  { local: 'Belém, BR', descricao: 'EXTRAVIO TEMPORÁRIO — Objeto localizado em unidade de logística reversa.' },
  { local: 'Cajamar, BR', descricao: 'Retornou à base. Aguardando reenvio. Motivo: endereço não localizado.' },
  { local: 'Manaus, BR', descricao: 'Encaminhado para conferência manual. Prazo de entrega: a definir.' },
  { local: 'Brasília, BR', descricao: 'Recebido em unidade de tratamento. Objeto em análise de rota.' },
  { local: 'Goiânia, BR', descricao: 'Em trânsito. Estimativa atualizada: entrega em 15 dias úteis.' },
  { local: 'Salvador, BR', descricao: 'Objeto retornando à unidade de origem. Motivo: avaria na embalagem.' },
  { local: 'Vitória, BR', descricao: 'Reenviado ao destinatário. Novo código de rastreio gerado.' },
  { local: 'Porto Alegre, BR', descricao: 'Transferido entre centros logísticos. Motivo: redistribuição de carga.' },
  { local: 'Cuiabá, BR', descricao: 'Aguardando transporte. Unidade sem veículo disponível no momento.' },
  { local: 'Curitiba, BR', descricao: 'Chegou ao centro de distribuição regional. Status: em separação.' },
]

function hashPedido(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

function eventoParaData(indice, pedidoId) {
  const base = new Date()
  // cada evento é 2-5 dias depois do anterior
  const offsetDias = indice * (2 + (hashPedido(pedidoId + indice) % 4))
  base.setDate(base.getDate() + offsetDias)
  base.setHours(8 + (hashPedido(pedidoId + indice + 'h') % 14))
  base.setMinutes(hashPedido(pedidoId + indice + 'm') % 60)
  return base
}

function formatarDataHora(data) {
  const d = String(data.getDate()).padStart(2, '0')
  const m = String(data.getMonth() + 1).padStart(2, '0')
  const a = data.getFullYear()
  const h = String(data.getHours()).padStart(2, '0')
  const min = String(data.getMinutes()).padStart(2, '0')
  return `${d}/${m}/${a} ${h}:${min}`
}

function estimativaEntrega(eventosVisiveis, pedidoId) {
  const base = new Date()
  const dias = 7 + (eventosVisiveis * 5) + (hashPedido(pedidoId + 'estimativa') % 14)
  base.setDate(base.getDate() + dias)
  return base.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function RastreioPedido({ pedidoId, padrao = 'sneaking' }) {
  const chaveVisita = `rastreio-${pedidoId}-visitas`
  const [eventosVisiveis, setEventosVisiveis] = useState(() => {
    const salvo = sessionStorage.getItem(chaveVisita)
    const atual = salvo ? Number(salvo) + 1 : 3 // começa com 3 eventos na 1a visita
    sessionStorage.setItem(chaveVisita, String(atual))
    return atual
  })

  useEffect(() => {
    sessionStorage.setItem(chaveVisita, String(eventosVisiveis))
  }, [eventosVisiveis, chaveVisita])

  const eventos = EVENTOS_PADRAO.slice(0, eventosVisiveis).map((e, i) => ({
    ...e,
    data: formatarDataHora(eventoParaData(i, pedidoId)),
  }))

  const entrega = estimativaEntrega(eventosVisiveis, pedidoId)

  return (
    <div data-padrao={padrao} className="border border-tinta/10 bg-white">
      <div className="border-b border-tinta/10 px-3 py-2">
        <p className="font-display text-sm text-tinta">RASTREIO DO PEDIDO</p>
        <p className="text-xs text-tinta/40">Código: NE{pedidoId.slice(-8)}BR</p>
      </div>

      <div className="p-3">
        {/* timeline */}
        <div className="relative ml-2">
          {/* linha vertical */}
          <div className="absolute bottom-0 left-[9px] top-0 w-0.5 bg-tinta/10" />

          {eventos.map((evento, i) => {
            const ultimo = i === eventos.length - 1
            return (
              <div key={i} className="relative pb-4 pl-6 last:pb-0">
                <span
                  className={`absolute left-0 top-1 h-5 w-5 rounded-full border-2 ${
                    ultimo
                      ? 'border-laranja bg-laranja/20'
                      : 'border-tinta/20 bg-tinta/5'
                  }`}
                />

                <p className="text-xs text-tinta/40">{evento.data}</p>
                <p className="text-sm font-semibold text-tinta">{evento.local}</p>
                <p className="text-xs text-tinta/60">{evento.descricao}</p>
              </div>
            )
          })}
        </div>

        {/* estimativa */}
        <div className="mt-4 border-t border-tinta/10 pt-3 text-center">
          <p className="text-xs text-tinta/40">PREVISÃO DE ENTREGA</p>
          <p className="font-display text-lg text-laranja">{entrega}</p>
          <p className="mt-1 text-[11px] text-tinta/30">
            Sujeito a alteração. Sempre sujeito a alteração.
          </p>
        </div>

        {/* mapa simplificado */}
        <div className="mt-3">
          <svg viewBox="0 0 300 120" className="w-full" role="img" aria-label="Mapa do rastreio">
            {/* fundo */}
            <rect width="300" height="120" fill="var(--color-fundo)" />

            {/* linha da rota */}
            <polyline
              points="20,60 80,50 120,55 170,80 190,40 230,45 255,70 270,30"
              fill="none"
              stroke="var(--color-laranja)"
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity="0.6"
            />

            {/* pontos */}
            {eventos.slice(0, 8).map((e, i) => {
              const x = 20 + i * 35
              const y = 60 + Math.sin(i * 1.3) * 25
              const ultimo = i === eventos.length - 1 && i < 7
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={ultimo ? 5 : 3}
                    fill={ultimo ? 'var(--color-laranja)' : 'var(--color-tinta)'}
                    opacity={ultimo ? 1 : 0.3}
                  />
                  {ultimo && (
                    <circle cx={x} cy={y} r={8} fill="none" stroke="var(--color-laranja)" opacity="0.3">
                      <animate attributeName="r" from="5" to="12" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
