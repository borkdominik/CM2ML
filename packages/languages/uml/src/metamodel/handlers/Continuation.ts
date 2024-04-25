import { Uml } from '../uml'
import { Continuation } from '../uml-metamodel'

export const ContinuationHandler = Continuation.createPassthroughHandler({
  [Uml.Attributes.setting]: { type: 'boolean', defaultValue: 'true' },
})
