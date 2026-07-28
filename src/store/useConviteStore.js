import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// endowed progress effect + forced action.
//
// a barra de progresso começa visualmente em 80% mesmo com zero convites
// enviados — o cérebro trata progresso pré-carregado como investimento
// já feito (Nunes & Drèze, 2006) e sente que "largar agora é jogar fora
// o que já avançou". é a mesma mecânica dos cartões de fidelidade que já
// vêm com 2 carimbos preenchidos.
//
// a meta nunca é atingível: sempre que o usuário completa N convites, a
// meta pula pra N+1 com a justificativa "quase lá, só mais 1". forced
// action + intervalo variável — o mesmo loop da roleta, mas com
// recrutamento social em vez de giro.
const META_INICIAL = 3

export const useConviteStore = create(
  persist(
    (set, get) => ({
      convitesEnviados: 0,
      meta: META_INICIAL,

      progressoVisual: () => {
        const { convitesEnviados, meta } = get()
        if (convitesEnviados >= meta) {
          // nunca deve chegar aqui porque a meta sobe antes
          return 95
        }
        // começa em 80% com zero convites, sobe 15% distribuído entre os convites
        return 80 + (convitesEnviados / meta) * 15
      },

      registrarConvite: () => {
        set((s) => {
          const novo = s.convitesEnviados + 1
          if (novo >= s.meta) {
            return { convitesEnviados: novo, meta: s.meta + 1 }
          }
          return { convitesEnviados: novo }
        })
      },
    }),
    { name: 'nadaexpress-convite' }
  )
)
