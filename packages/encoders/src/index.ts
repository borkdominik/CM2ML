import type { ParameterMetadata, Plugin } from '@cm2ml/plugin'

import { structuralEncoders } from '~/structural'

export * from '~/structural'

export const encoders: Plugin<unknown, ParameterMetadata>[] = [
  ...Object.values(structuralEncoders),
]

export const encoderRegistry = {
  ...structuralEncoders,
} as const
