import { structuralEncoders } from '~/structural'

export * from '~/structural'

export const encoders = [...Object.values(structuralEncoders)]

export const encoderRegistry = {
  ...structuralEncoders,
}
