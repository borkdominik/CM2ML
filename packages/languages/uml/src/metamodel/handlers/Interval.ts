import type { GraphNode } from '@cm2ml/ir'

import { Interval } from '../uml-metamodel'

export const IntervalHandler = Interval.createHandler(
  (interval, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_max(interval)
    addEdge_min(interval)
  },
)

function addEdge_max(_interval: GraphNode) {
  // TODO/Association
  // max : ValueSpecification [1..1] (opposite A_max_interval::interval)
  // Refers to the ValueSpecification denoting the maximum value of the range.
}

function addEdge_min(_interval: GraphNode) {
  // TODO/Association
  // min : ValueSpecification [1..1] (opposite A_min_interval::interval)
  // Refers to the ValueSpecification denoting the minimum value of the range.
}
