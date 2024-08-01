import { type Parser, parserMap } from '@cm2ml/builtin'
import type { GraphModel } from '@cm2ml/ir'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ParameterValues } from '../components/Parameters'

import { createSelectors, getNewParameters } from './utils'

interface SerializedModelState {
  isEditing: boolean
  parserName: string | undefined
  serializedModel: string
  parameters: ParameterValues
}

const currentVersion = 1

export interface ModelState {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  model: GraphModel | undefined
  error: unknown | undefined
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
  serializedModel: '',
  parser: undefined,
  parameters: {},
} as const satisfies Partial<ModelState>

export const useModelState = createSelectors(
  create(
    persist<ModelState, [], [], SerializedModelState>(
      (set, get) => ({
        isEditing: defaults.isEditing,
        setIsEditing: (isEditing: boolean) => set({ isEditing }),
        model: defaults.model,
        error: defaults.error,
        serializedModel: defaults.serializedModel,
        setSerializedModel: (serializedModel: string) => {
          set({ serializedModel })
          const { parser, parameters } = get()
          const { model, error } = tryParse(parser, serializedModel, parameters)
          set({ model, error })
        },
        parser: defaults.parser,
        setParser: (parser: Parser | undefined) => {
          const {
            serializedModel,
            parameters: oldParameters,
            parser: oldParser,
          } = get()
          const newParameters = parser
            ? getNewParameters(
              parser.parameters,
              oldParameters,
              oldParser?.parameters,
            )
            : oldParameters
          const { model, error } = tryParse(
            parser,
            serializedModel,
            newParameters,
          )
          set({ model, error, parser, parameters: newParameters })
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
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          isEditing: state.isEditing,
          serializedModel: state.serializedModel,
          parserName: state.parser?.name,
          parameters: state.parameters,
        }),
        merge: (persisted, current) => {
          if (!isSerializedModelState(persisted)) {
            return current
          }
          const { isEditing, parserName, serializedModel, parameters } = persisted
          const parser = parserName ? parserMap[parserName] : undefined
          const { model, error } = tryParse(parser, serializedModel, parameters)
          const state: ModelState = {
            ...current,
            isEditing,
            serializedModel,
            parser,
            parameters,
            model,
            error,
          }
          return state
        },
        migrate: () => {
          return {
            isEditing: defaults.isEditing,
            serializedModel: defaults.serializedModel,
            parserName: undefined,
            parameters: defaults.parameters,
          }
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
    const model = parser.validateAndInvoke(serializedModel, parameters)
    return { model }
  } catch (error) {
    return { error }
  }
}

function isSerializedModelState(
  state: unknown,
): state is SerializedModelState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof (state as SerializedModelState).isEditing === 'boolean' &&
    (typeof (state as SerializedModelState).parserName === 'string' || (state as SerializedModelState).parserName === undefined) &&
    typeof (state as SerializedModelState).serializedModel === 'string' &&
    typeof (state as SerializedModelState).parameters === 'object'
  )
}
