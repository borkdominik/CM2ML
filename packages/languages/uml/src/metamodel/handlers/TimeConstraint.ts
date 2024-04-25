import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { TimeConstraint } from '../uml-metamodel'

export const TimeConstraintHandler = TimeConstraint.createHandler(
  (timeConstraint, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_specification(timeConstraint)
  },
  {
    [Uml.Attributes.firstEvent]: { type: 'boolean', defaultValue: 'true' },
  },
)

function addEdge_specification(_timeConstraint: GraphNode) {
  // TODO/Association
  // ♦ specification : TimeInterval [1..1]{redefines IntervalConstraint::specification} (opposite A_specification_timeConstraint::timeConstraint)
  // TheTimeInterval constraining the duration.
}
