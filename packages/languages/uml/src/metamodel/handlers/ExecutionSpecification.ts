import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ExecutionSpecification, OccurrenceSpecification } from '../uml-metamodel'

export const ExecutionSpecificationHandler =
  ExecutionSpecification.createHandler(
    (executionSpecification, { onlyContainmentAssociations }) => {
      const finish = resolve(executionSpecification, 'finish', { type: OccurrenceSpecification })
      const start = resolve(executionSpecification, 'start', { type: OccurrenceSpecification })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_finish(executionSpecification, finish)
      addEdge_start(executionSpecification, start)
    },
  )

function addEdge_finish(executionSpecification: GraphNode, finish: GraphNode | undefined) {
  // finish : OccurrenceSpecification [1..1] (opposite A_finish_executionSpecification::executionSpecification)
  // References the OccurrenceSpecification that designates the finish of the Action or Behavior.
  if (!finish) {
    return
  }
  executionSpecification.model.addEdge('finish', executionSpecification, finish)
}

function addEdge_start(executionSpecification: GraphNode, start: GraphNode | undefined) {
  // start : OccurrenceSpecification [1..1] (opposite A_start_executionSpecification::executionSpecification)
  // References the OccurrenceSpecification that designates the start of the Action or Behavior.
  if (!start) {
    return
  }
  executionSpecification.model.addEdge('start', executionSpecification, start)
}
