import { Uml } from '../uml'
import { StructuralFeature } from '../uml-metamodel'

export const StructuralFeatureHandler =
  StructuralFeature.createPassthroughHandler({
    [Uml.Attributes.isReadOnly]: { type: 'boolean', defaultValue: 'false' },
  })
