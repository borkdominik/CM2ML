import type { GraphNode } from '@cm2ml/ir'

import { ExecutionOccurrenceSpecification } from '../uml-metamodel'

export const ExecutionOccurrenceSpecificationHandler =
  ExecutionOccurrenceSpecification.createHandler(
    (executionOccurrenceSpecification, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_execution(executionOccurrenceSpecification)
    },
  )

function addEdge_execution(_executionOccurrenceSpecification: GraphNode) {
  // TODO/Association
  // execution : ExecutionSpecification [1..1] (opposite A_execution_executionOccurrenceSpecification::executionOccurrenceSpecification )
  // References the execution specification describing the execution that is started or finished at this execution event.
}
