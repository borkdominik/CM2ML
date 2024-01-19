import type { GraphNode } from '@cm2ml/ir'

import { ActionExecutionSpecification } from '../uml-metamodel'

export const ActionExecutionSpecificationHandler =
  ActionExecutionSpecification.createHandler(
    (actionExecutionSpecification, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_action(actionExecutionSpecification)
    },
  )

function addEdge_action(_actionExecutionSpecification: GraphNode) {
  // TODO/Association
  // action : Action [1..1] (opposite A_action_actionExecutionSpecification::actionExecutionSpecification)
  // Action whose execution is occurring.
}
