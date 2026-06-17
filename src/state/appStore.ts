import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppState {
  /** Selected product/SKU context */
  selectedProductId: string | null
  setSelectedProductId: (id: string | null) => void

  /** Ship-to destination ZIP */
  destinationZip: string
  setDestinationZip: (zip: string) => void

  /** Active scenario — null means Baseline */
  activeScenarioId: string | null
  setActiveScenarioId: (id: string | null) => void

  /** Toast state for error-to-toast */
  toastQueue: ToastEntry[]
  addToast: (entry: Omit<ToastEntry, 'id'>) => void
  removeToast: (id: string) => void
}

export interface ToastEntry {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'danger'
}

let toastCounter = 0

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedProductId: null,
      setSelectedProductId: (id) => set({ selectedProductId: id }),

      destinationZip: '',
      setDestinationZip: (zip) => set({ destinationZip: zip }),

      activeScenarioId: null,
      setActiveScenarioId: (id) => set({ activeScenarioId: id }),

      toastQueue: [],
      addToast: (entry) =>
        set((state) => ({
          toastQueue: [
            ...state.toastQueue,
            { ...entry, id: String(++toastCounter) },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toastQueue: state.toastQueue.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'overdrive-app',
      partialize: (state) => ({
        selectedProductId: state.selectedProductId,
        destinationZip: state.destinationZip,
        activeScenarioId: state.activeScenarioId,
      }),
    },
  ),
)
