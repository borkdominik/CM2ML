import { Uml } from '../uml'
import { LiteralInteger } from '../uml-metamodel'

// Note: No additional associations over generalization
export const LiteralIntegerHandler = LiteralInteger.createHandler(
  () => {
    // if (onlyContainmentAssociations) {
    //   return
    // }
  },
  {
    [Uml.Attributes.value]: '0',
  },
)