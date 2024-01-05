import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createSelectors } from './utils'

export type Layout = 'compact' | 'extended'

const currentVersion = 0

export interface SettingsState {
  layout: Layout
  setLayout: (layout: Layout) => void
}

const defaults = {
  layout: 'compact',
} as const satisfies Partial<SettingsState>

export const useSettings = createSelectors(
  create(
    persist<SettingsState>(
      (set) => ({
        layout: defaults.layout,
        setLayout: (layout: Layout) => set({ layout }),
      }),
      {
        name: 'settings',
        version: currentVersion,
        migrate(persistedState, version) {
          if (version !== currentVersion) {
            return defaults as SettingsState
          }
          return persistedState as SettingsState
        },
      },
    ),
  ),
)
