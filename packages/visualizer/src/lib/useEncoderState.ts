import type { GraphModel } from '@cm2ml/ir'
import type { Plugin } from '@cm2ml/plugin'
import { create } from 'zustand'

import type { ParameterValues } from '../components/Parameters'

export type Encoder = Plugin<GraphModel, unknown, any>

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
    set({ encoder })
  },
  parameters: {},
  setParameters: (parameters: ParameterValues) => {
    const currentParameters = get().parameters
    const newParameters = { ...currentParameters, ...parameters }
    set({ parameters: newParameters })
  },
  close: () => set({ encoder: undefined }),
}))
