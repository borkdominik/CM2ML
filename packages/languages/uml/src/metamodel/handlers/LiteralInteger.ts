import { Uml } from '../uml'
import { LiteralInteger } from '../uml-metamodel'

export const LiteralIntegerHandler = LiteralInteger.createPassthroughHandler({
  [Uml.Attributes.value]: { type: 'integer', defaultValue: '0' },
})
