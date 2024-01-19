import type { GraphNode } from '@cm2ml/ir'

import { GeneralOrdering } from '../uml-metamodel'

export const GeneralOrderingHandler = GeneralOrdering.createHandler(
  (generalOrdering, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_after(generalOrdering)
    addEdge_before(generalOrdering)
  },
)
function addEdge_after(_generalOrdering: GraphNode) {
  // TODO/Association
  // after : OccurrenceSpecification [1..1] (opposite OccurrenceSpecification::toBefore)
  // The OccurrenceSpecification referenced comes after the OccurrenceSpecification referenced by before.
}

function addEdge_before(_generalOrdering: GraphNode) {
  // TODO/Association
  // before : OccurrenceSpecification [1..1] (opposite OccurrenceSpecification::toAfter)
  // The OccurrenceSpecification referenced comes before the OccurrenceSpecification referenced by after.
}
