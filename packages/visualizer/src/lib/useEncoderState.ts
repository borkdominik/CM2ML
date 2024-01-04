import { type Encoder, encoderMap } from '@cm2ml/builtin'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ParameterValues } from '../components/Parameters'

import { getNewParameters } from './utils'

export interface SerializedEncoderState {
  encoderName: string | undefined
  parameters: ParameterValues
}

export interface EncoderState {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  encoder: Encoder | undefined
  setEncoder: (encoder: Encoder | undefined) => void
  parameters: ParameterValues
  setParameters: (parameters: ParameterValues) => void
  close: () => void
}

export const useEncoderState = create(
  persist<EncoderState>(
    (set, get) => ({
      isEditing: true,
      setIsEditing: (isEditing: boolean) => set({ isEditing }),
      encoder: undefined,
      setEncoder: (encoder: Encoder | undefined) => {
        const oldParameters = get().parameters
        const newParameters = encoder
          ? getNewParameters(encoder.parameters, oldParameters)
          : oldParameters
        set({ encoder, parameters: newParameters })
      },
      parameters: {},
      setParameters: (parameters: ParameterValues) => {
        const currentParameters = get().parameters
        const newParameters = { ...currentParameters, ...parameters }
        set({ parameters: newParameters })
      },
      close: () => set({ encoder: undefined }),
    }),
    {
      name: 'encoder',
      serialize({ state }) {
        const serializableState: SerializedEncoderState = {
          parameters: state.parameters,
          encoderName: state.encoder?.name,
        }
        return JSON.stringify(serializableState)
      },
      deserialize(serializedState) {
        const { encoderName, parameters } = JSON.parse(
          serializedState,
        ) as SerializedEncoderState
        const encoder = encoderName ? encoderMap[encoderName] : undefined
        const state: Partial<EncoderState> = {
          parameters,
          encoder,
        }
        return { state: state as EncoderState, version: 0 }
      },
    },
  ),
)
