import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Layout = 'compact' | 'extended'

export interface SettingsState {
  layout: Layout
  setLayout: (layout: Layout) => void
}

export const useSettings = create(
  persist<SettingsState>(
    (set) => ({
      layout: 'compact',
      setLayout: (layout: Layout) => set({ layout }),
    }),
    { name: 'settings' },
  ),
)
