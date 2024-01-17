import { AssociationClass } from '../uml-metamodel'

export const AssociationClassHandler = AssociationClass.createHandler(
  (_associationClass, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
)
