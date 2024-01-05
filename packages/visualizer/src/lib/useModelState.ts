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
}

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

export const useModelState = createSelectors(
  create(
    persist<ModelState>(
      (set, get) => ({
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
        parameters: {},
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
        close: () => set({ model: undefined }),
      }),
      {
        name: 'model',
        serialize({ state }) {
          const serializableState: SerializedModelState = {
            serializedModel: state.serializedModel,
            parameters: state.parameters,
            parserName: state.parser?.name,
          }
          return JSON.stringify(serializableState)
        },
        deserialize(serializedState) {
          const { serializedModel, parserName, parameters } = JSON.parse(
            serializedState,
          ) as SerializedModelState
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
          return { state: state as ModelState, version: 0 }
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
