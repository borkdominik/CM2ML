import type { GraphNode } from '@cm2ml/ir'

import { IntervalConstraint } from '../uml-metamodel'

export const IntervalConstraintHandler = IntervalConstraint.createHandler(
  (intervalConstraint, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_specification(intervalConstraint)
  },
)

function addEdge_specification(_intervalConstraint: GraphNode) {
  // TODO/Association
  // ♦ specification : Interval [1..1]{redefines Constraint::specification} (opposite A_specification_intervalConstraint::intervalConstraint)
  // The Interval that specifies the condition of the IntervalConstraint.
}
