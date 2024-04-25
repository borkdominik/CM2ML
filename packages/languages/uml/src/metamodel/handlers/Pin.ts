import { Uml } from '../uml'
import { Pin } from '../uml-metamodel'

export const PinHandler = Pin.createPassthroughHandler({
  [Uml.Attributes.isControl]: { type: 'boolean', defaultValue: 'false' },
})
