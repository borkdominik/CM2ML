import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { CallOperationAction } from '../uml-metamodel'

export const CallOperationActionHandler = CallOperationAction.createHandler(
  (callOperationAction, { onlyContainmentAssociations }) => {
    const operation = resolveFromAttribute(callOperationAction, 'operation')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_operation(callOperationAction, operation)
    addEdge_target(callOperationAction)
  },
)

function addEdge_operation(callOperationAction: GraphNode, operation: GraphNode | undefined) {
  // TODO/Association
  // operation : Operation [1..1] (opposite A_operation_callOperationAction::callOperationAction)
  // The Operation being invoked.
  if (!operation) {
    return
  }
  callOperationAction.model.addEdge('operation', callOperationAction, operation)
}

function addEdge_target(_callOperationAction: GraphNode) {
  // TODO/Association
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_callOperationAction::callOperationAction)
  // The InputPin that provides the target object to which the Operation call request is sent.
}
