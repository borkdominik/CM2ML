import { type Encoder, encoderMap } from '@cm2ml/builtin'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ParameterValues } from '../components/Parameters'

import { createSelectors, getNewParameters } from './utils'

interface SerializedEncoderState {
  isEditing: boolean
  encoderName: string | undefined
  parameters: ParameterValues
}

const currentVersion = 1

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
    persist<EncoderState, [], [], SerializedEncoderState>(
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
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          isEditing: state.isEditing,
          encoderName: state.encoder?.name,
          parameters: state.parameters,
        }),
        merge: (persisted, current) => {
          if (!isSerializedEncoderState(persisted)) {
            return current
          }
          const { encoderName, isEditing, parameters } = persisted
          const encoder = encoderName ? encoderMap[encoderName] : undefined
          return { ...current, encoder, isEditing, parameters }
        },
        migrate: () => {
          return {
            isEditing: defaults.isEditing,
            encoderName: undefined,
            parameters: defaults.parameters,
          }
        },
      },
    ),
  ),
)

function isSerializedEncoderState(
  state: unknown,
): state is SerializedEncoderState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof (state as SerializedEncoderState).isEditing === 'boolean' &&
    (typeof (state as SerializedEncoderState).encoderName === 'string' || (state as SerializedEncoderState).encoderName === undefined) &&
    typeof (state as SerializedEncoderState).parameters === 'object'
  )
}
