import { Uml } from '../uml'
import { Pin } from '../uml-metamodel'

export const PinHandler = Pin.createHandler(
  (_pin, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
  {
    [Uml.Attributes.isControl]: 'false',
  },
)
