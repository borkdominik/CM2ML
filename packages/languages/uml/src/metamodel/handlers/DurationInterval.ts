import type { GraphNode } from '@cm2ml/ir'

import { DurationInterval } from '../uml-metamodel'

export const DurationIntervalHandler = DurationInterval.createHandler(
  (durationInterval, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_max(durationInterval)
    addEdge_min(durationInterval)
  },
)

function addEdge_max(_durationInterval: GraphNode) {
  // TODO/Association
  // max : Duration [1..1]{redefines Interval::max} (opposite A_max_durationInterval::durationInterval)
  // Refers to the Duration denoting the maximum value of the range.
}

function addEdge_min(_durationInterval: GraphNode) {
  // TODO/Association
  // min : Duration [1..1]{redefines Interval::min} (opposite A_min_durationInterval::durationInterval)
  // Refers to the Duration denoting the minimum value of the range.
}
