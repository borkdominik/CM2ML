import { FinalNode } from '../uml-metamodel'

export const FinalNodeHandler = FinalNode.createHandler(
  (_finalNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
)
