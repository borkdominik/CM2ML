import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { GeneralOrdering, OccurrenceSpecification } from '../uml-metamodel'

export const GeneralOrderingHandler = GeneralOrdering.createHandler(
  (generalOrdering, { onlyContainmentAssociations }) => {
    const after = resolve(generalOrdering, 'after', { type: OccurrenceSpecification })
    const before = resolve(generalOrdering, 'before', { type: OccurrenceSpecification })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_after(generalOrdering, after)
    addEdge_before(generalOrdering, before)
  },
)
function addEdge_after(generalOrdering: GraphNode, after: GraphNode | undefined) {
  // after : OccurrenceSpecification [1..1] (opposite OccurrenceSpecification::toBefore)
  // The OccurrenceSpecification referenced comes after the OccurrenceSpecification referenced by before.
  if (!after) {
    return
  }
  generalOrdering.model.addEdge('after', generalOrdering, after)
}

function addEdge_before(generalOrdering: GraphNode, before: GraphNode | undefined) {
  // before : OccurrenceSpecification [1..1] (opposite OccurrenceSpecification::toAfter)
  // The OccurrenceSpecification referenced comes before the OccurrenceSpecification referenced by after.
  if (!before) {
    return
  }
  generalOrdering.model.addEdge('before', generalOrdering, before)
}
