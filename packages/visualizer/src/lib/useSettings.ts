import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createSelectors } from './utils'

export const irViews = ['graph', 'tree'] as const

export type IRView = typeof irViews[number]

export const layouts = ['compact', 'extended'] as const

export type Layout = typeof layouts[number]

const currentVersion = 1

export interface SettingsState {
  irView: IRView
  setIRView: (irView: IRView) => void
  layout: Layout
  setLayout: (layout: Layout) => void
}

const defaults = {
  irView: 'graph',
  layout: 'extended',
} as const satisfies Partial<SettingsState>

export const useSettings = createSelectors(
  create(
    persist<SettingsState>(
      (set) => ({
        irView: defaults.irView,
        setIRView: (irView) => set({ irView }),
        layout: defaults.layout,
        setLayout: (layout) => set({ layout }),
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
