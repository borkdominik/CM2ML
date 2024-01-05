import type { Parser } from '@cm2ml/builtin'
import { parserMap } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ParameterValues } from '../components/Parameters'

import { createSelectors, getNewParameters } from './utils'

export interface SerializedModelState {
  parserName: string | undefined
  serializedModel: string | undefined
  parameters: ParameterValues
  version: number | undefined
}

const currentVersion = 0

export interface ModelState {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  model: GraphModel | undefined
  error: unknown | undefined
  fit: (() => void) | undefined
  setFit: (fit: (() => void) | undefined) => void
  serializedModel: string
  setSerializedModel: (serializedModel: string) => void
  parser: Parser | undefined
  setParser: (parser: Parser | undefined) => void
  parameters: ParameterValues
  setParameters: (parameters: ParameterValues) => void
  clear: () => void
}

const defaults = {
  isEditing: true,
  model: undefined,
  error: undefined,
  fit: undefined,
  serializedModel: '',
  parser: undefined,
  parameters: {},
} as const satisfies Partial<ModelState>

export const useModelState = createSelectors(
  create(
    persist<ModelState>(
      (set, get) => ({
        isEditing: defaults.isEditing,
        setIsEditing: (isEditing: boolean) => set({ isEditing }),
        model: defaults.model,
        error: defaults.error,
        fit: defaults.fit,
        setFit: (fit: (() => void) | undefined) => set({ fit }),
        serializedModel: defaults.serializedModel,
        setSerializedModel: (serializedModel: string) => {
          set({ serializedModel })
          const { parser, parameters } = get()
          const { model, error } = tryParse(parser, serializedModel, parameters)
          set({ model, error })
        },
        parser: defaults.parser,
        setParser: (parser: Parser | undefined) => {
          set({ parser })
          const { serializedModel, parameters: oldParameters } = get()
          const newParameters = parser
            ? getNewParameters(parser.parameters, oldParameters)
            : oldParameters
          const { model, error } = tryParse(
            parser,
            serializedModel,
            newParameters,
          )
          set({ model, error, parameters: newParameters })
        },
        parameters: defaults.parameters,
        setParameters: (parameters: ParameterValues) => {
          const currentParameters = get().parameters
          const newParameters = { ...currentParameters, ...parameters }
          set({ parameters: newParameters })
          const { parser, serializedModel } = get()
          const { model, error } = tryParse(
            parser,
            serializedModel,
            newParameters,
          )
          set({ model, error })
        },
        clear: () => set(defaults),
      }),
      {
        name: 'model',
        version: currentVersion,
        serialize({ state, version }) {
          const serializableState: SerializedModelState = {
            serializedModel: state.serializedModel,
            parameters: state.parameters,
            parserName: state.parser?.name,
            version,
          }
          return JSON.stringify(serializableState)
        },
        deserialize(serializedState) {
          const { serializedModel, parserName, parameters, version } =
            JSON.parse(serializedState) as SerializedModelState
          const parser = parserName ? parserMap[parserName] : undefined
          const { model, error } = tryParse(parser, serializedModel, parameters)
          const state: Partial<ModelState> = {
            serializedModel,
            parameters,
            parser,
            model,
            error,
            isEditing: model === undefined,
          }
          return { state: state as ModelState, version }
        },
        migrate(persistedState, version) {
          if (version !== currentVersion) {
            return defaults as ModelState
          }
          return persistedState as ModelState
        },
      },
    ),
  ),
)

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
