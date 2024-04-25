import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { DurationConstraint } from '../uml-metamodel'

export const DurationConstraintHandler = DurationConstraint.createHandler(
  (durationConstraint, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_specification(durationConstraint)
  },
  {
    [Uml.Attributes.firstEvent]: { type: 'boolean' },
  },
)

function addEdge_specification(_durationConstraint: GraphNode) {
  // TODO/Association
  // ♦ specification : DurationInterval [1..1]{redefines IntervalConstraint::specification} (opposite A_specification_durationConstraint::durationConstraint)
  // The DurationInterval constraining the duration.
}
