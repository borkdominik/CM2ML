import { Uml } from '../uml'
import { LiteralUnlimitedNatural } from '../uml-metamodel'

// Note: No additional associations over generalization
export const LiteralUnlimitedNaturalHandler =
  LiteralUnlimitedNatural.createHandler(
    () => {
      // if (onlyContainmentAssociations) {
      //   return
      // }
      // TODO
    },
    {
      [Uml.Attributes.value]: '0',
    },
  )
