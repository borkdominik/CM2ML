import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Action, ActionExecutionSpecification } from '../uml-metamodel'

export const ActionExecutionSpecificationHandler =
  ActionExecutionSpecification.createHandler(
    (actionExecutionSpecification, { onlyContainmentAssociations }) => {
      const action = resolve(actionExecutionSpecification, 'action', { type: Action })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_action(actionExecutionSpecification, action)
    },
  )

function addEdge_action(actionExecutionSpecification: GraphNode, action: GraphNode | undefined) {
  // action : Action [1..1] (opposite A_action_actionExecutionSpecification::actionExecutionSpecification)
  // Action whose execution is occurring.
  if (!action) {
    return
  }
  actionExecutionSpecification.model.addEdge('action', actionExecutionSpecification, action)
}
