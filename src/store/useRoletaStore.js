import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export function hojeLocal() {
  // 'sv' formata como YYYY-MM-DD na data local — vira a chave do giro diário
  return new Date().toLocaleDateString('sv')
}

export const useRoletaStore = create(
  persist(
    (set, get) => ({
      ultimoGiroGratis: null,
      girosExtras: 0,
      totalGiros: 0,

      temGiroGratis: () => get().ultimoGiroGratis !== hojeLocal(),

      girosDisponiveis: () => (get().temGiroGratis() ? 1 : 0) + get().girosExtras,

      consumirGiro: () => {
        if (get().temGiroGratis()) {
          set((estado) => ({ ultimoGiroGratis: hojeLocal(), totalGiros: estado.totalGiros + 1 }))
          return true
        }
        if (get().girosExtras > 0) {
          set((estado) => ({ girosExtras: estado.girosExtras - 1, totalGiros: estado.totalGiros + 1 }))
          return true
        }
        return false
      },

      ganharGiroExtra: () => set((estado) => ({ girosExtras: estado.girosExtras + 1 })),
    }),
    { name: 'nadaexpress-roleta' }
  )
)
