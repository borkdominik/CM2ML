import { Uml } from '../uml'
import { LiteralReal } from '../uml-metamodel'

export const LiteralRealHandler = LiteralReal.createPassthroughHandler({
  [Uml.Attributes.value]: { type: 'float' },
})
