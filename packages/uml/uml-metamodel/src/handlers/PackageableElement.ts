import { Uml } from '../uml'
import { PackageableElement } from '../uml-metamodel'

// Note: No additional associations over generalization
export const PackageableElementHandler = PackageableElement.createHandler(
  () => {
    // if (onlyContainmentAssociations) {
    //   return
    // }
    // TODO
  },
  {
    [Uml.Attributes.visibility]: 'public',
  },
)
