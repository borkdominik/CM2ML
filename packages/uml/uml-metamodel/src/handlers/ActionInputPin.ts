import type { GraphNode } from '@cm2ml/ir'

import { ActionInputPin } from '../uml-metamodel'

export const ActionInputPinHandler = ActionInputPin.createHandler(
  (actionInputPin, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_fromAction(actionInputPin)
  },
)

function addEdge_fromAction(_actionInputPin: GraphNode) {
  // TODO/Association
  // ♦ fromAction : Action [1..1]{subsets Element::ownedElement} (opposite A_fromAction_actionInputPin::actionInputPin)
  // The Action used to provide the values of the ActionInputPin.
}
