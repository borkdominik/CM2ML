import type { GraphNode } from '@cm2ml/ir'

import { ChangeEvent } from '../uml-metamodel'

export const ChangeEventHandler = ChangeEvent.createHandler(
  (changeEvent, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_changeExpression(changeEvent)
  },
)

function addEdge_changeExpression(_changeEvent: GraphNode) {
  // TODO/Association
  // ♦ changeExpression : ValueSpecification [1..1]{subsets Element::ownedElement} (opposite A_changeExpression_changeEvent::changeEvent)
  // A Boolean-valued ValueSpecification that will result in a ChangeEvent whenever its value changes from false to true.
}
