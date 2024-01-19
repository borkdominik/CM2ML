import type { GraphNode } from '@cm2ml/ir'

import { ExecutionSpecification } from '../uml-metamodel'

export const ExecutionSpecificationHandler =
  ExecutionSpecification.createHandler(
    (executionSpecification, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_finish(executionSpecification)
      addEdge_start(executionSpecification)
    },
  )

function addEdge_finish(_executionSpecification: GraphNode) {
  // TODO
  // finish : OccurrenceSpecification [1..1] (opposite A_finish_executionSpecification::executionSpecification)
  // References the OccurrenceSpecification that designates the finish of the Action or Behavior.
}

function addEdge_start(_executionSpecification: GraphNode) {
  // TODO
  // start : OccurrenceSpecification [1..1] (opposite A_start_executionSpecification::executionSpecification)
  // References the OccurrenceSpecification that designates the start of the Action or Behavior.
}
