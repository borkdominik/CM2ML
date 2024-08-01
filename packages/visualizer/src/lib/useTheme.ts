import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createSelectors } from './utils'

export const themes = ['light', 'dark'] as const

export type Theme = (typeof themes)[number]

const currentVersion = 0

export interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const defaultTheme: Theme = document.body.classList.contains('dark') ? 'dark' : 'light'

function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.body.classList.remove('dark')
  } else {
    document.body.classList.add('dark')
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'light' ? '#ffffff' : '#0c0a09')
}

export const useTheme = createSelectors(
  create(persist<ThemeState>((set, _get) => ({
    theme: defaultTheme,
    setTheme: (theme: Theme) => {
      applyTheme(theme)
      set({ theme })
    },
  }), {
    name: 'theme',
    version: currentVersion,
    storage: createJSONStorage(() => localStorage),
    onRehydrateStorage: () => {
      return (state) => {
        if (!state) {
          return
        }
        applyTheme(state.theme)
      }
    },
  })),
)
