import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { create } from 'zustand'

import type { ParameterValues } from '../components/Parameters'

export type Parser = Plugin<string, GraphModel, any>

export interface ModelState {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  model: GraphModel | undefined
  error: unknown | undefined
  fit: (() => void) | undefined
  setFit: (fit: (() => void) | undefined) => void
  serializedModel: string | undefined
  setSerializedModel: (serializedModel: string) => void
  parser: Parser | undefined
  setParser: (parser: Parser | undefined) => void
  parameters: ParameterValues
  setParameters: (parameters: ParameterValues) => void
  close: () => void
}

export const useModelState = create<ModelState>((set, get) => ({
  isEditing: true,
  setIsEditing: (isEditing: boolean) => set({ isEditing }),
  model: undefined,
  error: undefined,
  fit: undefined,
  setFit: (fit: (() => void) | undefined) => set({ fit }),
  serializedModel: '',
  setSerializedModel: (serializedModel: string) => {
    set({ serializedModel })
    const { parser, parameters } = get()
    const { model, error } = tryParse(parser, serializedModel, parameters)
    set({ model, error })
  },
  parser: undefined,
  setParser: (parser: Parser | undefined) => {
    set({ parser })
    const { serializedModel, parameters } = get()
    const { model, error } = tryParse(parser, serializedModel, parameters)
    set({ model, error })
  },
  parameters: {},
  setParameters: (parameters: ParameterValues) => {
    const currentParameters = get().parameters
    const newParameters = { ...currentParameters, ...parameters }
    set({ parameters: newParameters })
    const { parser, serializedModel } = get()
    const { model, error } = tryParse(parser, serializedModel, newParameters)
    set({ model, error })
  },
  close: () => set({ model: undefined }),
}))

function tryParse(
  parser: Parser | undefined,
  serializedModel: string | undefined,
  parameters: ParameterValues,
) {
  if (!serializedModel || !parser) {
    return {}
  }
  try {
    const model = parser.invoke(serializedModel, parameters)
    return { model }
  } catch (error) {
    return { error }
  }
}
