import { Uml } from '../uml'
import { Model } from '../uml-metamodel'

export const ModelHandler = Model.createPassthroughHandler({
  [Uml.Attributes.viewpoint]: { type: 'string' },
})
