import { ControlNode } from '../uml-metamodel'

export const ControlNodeHandler = ControlNode.createHandler(
  (_controlNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
)
