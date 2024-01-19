import type { GraphNode } from '@cm2ml/ir'

import { TimeInterval } from '../uml-metamodel'

export const TimeIntervalHandler = TimeInterval.createHandler(
  (timeInterval, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_max(timeInterval)
    addEdge_min(timeInterval)
  },
)

function addEdge_max(_timeInterval: GraphNode) {
  // TODO/Association
  // max : TimeExpression [1..1]{redefines Interval::max} (opposite A_max_timeInterval::timeInterval)
  // Refers to the TimeExpression denoting the maximum value of the range.
}

function addEdge_min(_timeInterval: GraphNode) {
  // TODO/Association
  // min : TimeExpression [1..1]{redefines Interval::min} (opposite A_min_timeInterval::timeInterval)
  // Refers to the TimeExpression denoting the minimum value of the range.
}
