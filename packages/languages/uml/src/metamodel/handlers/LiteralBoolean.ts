import { Uml } from '../uml'
import { LiteralBoolean } from '../uml-metamodel'

export const LiteralBooleanHandler = LiteralBoolean.createPassthroughHandler({
  [Uml.Attributes.value]: 'false',
})
