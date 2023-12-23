import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { create } from 'zustand'

export type Encoder = Plugin<GraphModel, unknown, any>

export interface AppState {
  model: GraphModel | undefined
  encoder: Encoder | undefined
  clearModel: () => void
  setModel: (model: GraphModel) => void
  clearEncoder: () => void
  setEncoder: (encoder: Encoder) => void
  fitGraph: (() => void) | undefined
  setFitGraph: (fit: (() => void) | undefined) => void
}

export const useAppState = create<AppState>((set, _get) => ({
  model: undefined,
  encoder: undefined,
  fitGraph: undefined,
  clearModel: () => set({ model: undefined, fitGraph: undefined }),
  setModel: (model: GraphModel) => set({ model, fitGraph: undefined }),
  clearEncoder: () => set({ encoder: undefined }),
  setEncoder: (encoder: Encoder) => set({ encoder }),
  setFitGraph: (fit: (() => void) | undefined) => {
    set({ fitGraph: fit })
  },
}))
