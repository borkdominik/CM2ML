import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  alwaysShowEditors: boolean
  setAlwaysShowEditors: (alwaysShowEditors: boolean) => void
}

export const useSettings = create(
  persist<SettingsState>(
    (set) => ({
      alwaysShowEditors: false,
      setAlwaysShowEditors: (alwaysShowEditors: boolean) =>
        set({ alwaysShowEditors }),
    }),
    { name: 'settings' },
  ),
)
