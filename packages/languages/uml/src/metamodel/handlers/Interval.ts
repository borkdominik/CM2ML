import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Interval, ValueSpecification } from '../uml-metamodel'

export const IntervalHandler = Interval.createHandler(
  (interval, { onlyContainmentAssociations }) => {
    const max = resolve(interval, 'max', { type: ValueSpecification })
    const min = resolve(interval, 'min', { type: ValueSpecification })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_max(interval, max)
    addEdge_min(interval, min)
  },
)

function addEdge_max(interval: GraphNode, max: GraphNode | undefined) {
  // max : ValueSpecification [1..1] (opposite A_max_interval::interval)
  // Refers to the ValueSpecification denoting the maximum value of the range.
  if (!max) {
    return
  }
  interval.model.addEdge('max', interval, max)
}

function addEdge_min(interval: GraphNode, min: GraphNode | undefined) {
  // min : ValueSpecification [1..1] (opposite A_min_interval::interval)
  // Refers to the ValueSpecification denoting the minimum value of the range.
  if (!min) {
    return
  }
  interval.model.addEdge('min', interval, min)
}
