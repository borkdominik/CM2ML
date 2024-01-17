import { Uml } from '../uml'
import { StructuralFeature } from '../uml-metamodel'

// Note: No additional associations over generalization
export const StructuralFeatureHandler = StructuralFeature.createHandler(
  (_structuralFeature, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      //   return
    }
  },
  {
    [Uml.Attributes.isReadOnly]: 'false',
  },
)
