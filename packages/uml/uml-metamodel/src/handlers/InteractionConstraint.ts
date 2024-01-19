import type { GraphNode } from '@cm2ml/ir'

import { InteractionConstraint } from '../uml-metamodel'

export const InteractionConstraintHandler = InteractionConstraint.createHandler(
  (interactionConstraint, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_maxint(interactionConstraint)
    addEdge_minint(interactionConstraint)
  },
)
function addEdge_maxint(_interactionConstraint: GraphNode) {
  // TODO/Association
  // ♦ maxint : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_maxint_interactionConstraint::interactionConstraint)
  // The maximum number of iterations of a loop
}

function addEdge_minint(_interactionConstraint: GraphNode) {
  // TODO/Association
  // ♦ minint : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_minint_interactionConstraint::interactionConstraint)
  // The minimum number of iterations of a loop
}
