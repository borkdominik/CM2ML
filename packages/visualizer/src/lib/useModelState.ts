import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { create } from 'zustand'

import type { ParameterValues } from '../components/Parameters'

export type Parser = Plugin<string, GraphModel, any>

export interface ModelState {
  model: GraphModel | undefined
  setModel: (model: GraphModel | undefined) => void
  fit: () => void
  setFit: (fit: () => void) => void
  serializedModel: string | undefined
  setSerializedModel: (serializedModel: string) => void
  parser: Parser | undefined
  setParser: (parser: Parser | undefined) => void
  parameters: ParameterValues
  setParameters: (parameters: ParameterValues) => void
  close: () => void
}

export const useModelState = create<ModelState>((set, get) => ({
  model: undefined,
  setModel: (model: GraphModel | undefined) => set({ model }),
  fit: () => {},
  setFit: (fit: () => void) => set({ fit }),
  serializedModel: '',
  setSerializedModel: (serializedModel: string) => set({ serializedModel }),
  parser: undefined,
  setParser: (parser: Parser | undefined) => set({ parser }),
  parameters: {},
  setParameters: (parameters: ParameterValues) => {
    const currentParameters = get().parameters
    const newParameters = { ...currentParameters, ...parameters }
    set({ parameters: newParameters })
  },
  close: () => set({ model: undefined }),
}))
