import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { ExecutionOccurrenceSpecification, ExecutionSpecification } from '../uml-metamodel'

export const ExecutionOccurrenceSpecificationHandler =
  ExecutionOccurrenceSpecification.createHandler(
    (executionOccurrenceSpecification, { onlyContainmentAssociations }) => {
      const execution = resolveFromAttribute(executionOccurrenceSpecification, 'execution', { type: ExecutionSpecification })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_execution(executionOccurrenceSpecification, execution)
    },
  )

function addEdge_execution(executionOccurrenceSpecification: GraphNode, execution: GraphNode | undefined) {
  // TODO/Association
  // execution : ExecutionSpecification [1..1] (opposite A_execution_executionOccurrenceSpecification::executionOccurrenceSpecification )
  // References the execution specification describing the execution that is started or finished at this execution event.
  if (!execution) {
    return
  }
  executionOccurrenceSpecification.model.addEdge('execution', executionOccurrenceSpecification, execution)
}
