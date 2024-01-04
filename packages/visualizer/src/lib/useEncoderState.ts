import type { Encoder } from '@cm2ml/builtin'
import { create } from 'zustand'

import type { ParameterValues } from '../components/Parameters'

import { getNewParameters } from './utils'

export interface EncoderState {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  encoder: Encoder | undefined
  setEncoder: (encoder: Encoder | undefined) => void
  parameters: ParameterValues
  setParameters: (parameters: ParameterValues) => void
  close: () => void
}

export const useEncoderState = create<EncoderState>((set, get) => ({
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
}))
