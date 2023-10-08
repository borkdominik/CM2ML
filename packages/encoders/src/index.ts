import type { ParameterMetadata, Plugin } from '@cm2ml/plugin'

import { structuralEncoders } from '~/structural'

export * from '~/structural'

export const encoders: Plugin<string, unknown, ParameterMetadata>[] = [
  ...Object.values(structuralEncoders),
]

export const encoderRegistry = {
  ...structuralEncoders,
} as const
