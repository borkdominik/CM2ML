import { type Encoder, encoderMap } from '@cm2ml/builtin'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ParameterValues } from '../components/Parameters'

import { createSelectors, getNewParameters } from './utils'

export interface SerializedEncoderState {
  isEditing: boolean
  encoderName: string | undefined
  parameters: ParameterValues
}

const currentVersion = 0

export interface EncoderState {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  encoder: Encoder | undefined
  setEncoder: (encoder: Encoder | undefined) => void
  parameters: ParameterValues
  setParameters: (parameters: ParameterValues) => void
  clear: () => void
}

const defaults = {
  isEditing: true,
  encoder: undefined,
  parameters: {},
} as const satisfies Partial<EncoderState>

export const useEncoderState = createSelectors(
  create(
    persist<EncoderState>(
      (set, get) => ({
        isEditing: defaults.isEditing,
        setIsEditing: (isEditing: boolean) => set({ isEditing }),
        encoder: defaults.encoder,
        setEncoder: (encoder: Encoder | undefined) => {
          const { encoder: oldEncoder, parameters: oldParameters } = get()
          const newParameters = encoder
            ? getNewParameters(
                encoder.parameters,
                oldParameters,
                oldEncoder?.parameters,
              )
            : oldParameters
          set({ encoder, parameters: newParameters })
        },
        parameters: defaults.parameters,
        setParameters: (parameters: ParameterValues) => {
          const currentParameters = get().parameters
          const newParameters = { ...currentParameters, ...parameters }
          set({ parameters: newParameters })
        },
        clear: () => set(defaults),
      }),
      {
        name: 'encoder',
        version: currentVersion,
        serialize({ state }) {
          const serializableState: SerializedEncoderState = {
            isEditing: state.isEditing,
            parameters: state.parameters,
            encoderName: state.encoder?.name,
          }
          return JSON.stringify(serializableState)
        },
        deserialize(serializedState) {
          const { encoderName, isEditing, parameters } = JSON.parse(
            serializedState,
          ) as SerializedEncoderState
          const encoder = encoderName ? encoderMap[encoderName] : undefined
          const state: Partial<EncoderState> = {
            parameters,
            encoder,
            isEditing,
          }
          return { state: state as EncoderState, version: 0 }
        },
        migrate(persistedState, version) {
          if (version !== currentVersion) {
            return defaults as EncoderState
          }
          return persistedState as EncoderState
        },
      },
    ),
  ),
)
