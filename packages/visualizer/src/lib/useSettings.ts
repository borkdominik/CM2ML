import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createSelectors } from './utils'

export type Layout = 'compact' | 'extended'

export interface SettingsState {
  layout: Layout
  setLayout: (layout: Layout) => void
}

export const useSettings = createSelectors(
  create(
    persist<SettingsState>(
      (set) => ({
        layout: 'compact',
        setLayout: (layout: Layout) => set({ layout }),
      }),
      { name: 'settings' },
    ),
  ),
)
