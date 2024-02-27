import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { TimeExpression, TimeInterval } from '../uml-metamodel'

export const TimeIntervalHandler = TimeInterval.createHandler(
  (timeInterval, { onlyContainmentAssociations }) => {
    const max = resolve(timeInterval, 'max', { type: TimeExpression })
    const min = resolve(timeInterval, 'min', { type: TimeExpression })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_max(timeInterval, max)
    addEdge_min(timeInterval, min)
  },
)

function addEdge_max(timeInterval: GraphNode, max: GraphNode | undefined) {
  // max : TimeExpression [1..1]{redefines Interval::max} (opposite A_max_timeInterval::timeInterval)
  // Refers to the TimeExpression denoting the maximum value of the range.
  if (!max) {
    return
  }
  timeInterval.model.addEdge('max', timeInterval, max)
}

function addEdge_min(timeInterval: GraphNode, min: GraphNode | undefined) {
  // min : TimeExpression [1..1]{redefines Interval::min} (opposite A_min_timeInterval::timeInterval)
  // Refers to the TimeExpression denoting the minimum value of the range.
  if (!min) {
    return
  }
  timeInterval.model.addEdge('min', timeInterval, min)
}
