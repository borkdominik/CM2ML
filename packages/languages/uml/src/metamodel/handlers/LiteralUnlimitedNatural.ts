import { Uml } from '../uml'
import { LiteralUnlimitedNatural } from '../uml-metamodel'

export const LiteralUnlimitedNaturalHandler =
  LiteralUnlimitedNatural.createPassthroughHandler({
    [Uml.Attributes.value]: { type: 'integer', defaultValue: '0' },
  })
