import type { GraphNode } from '@cm2ml/ir'

import { CallOperationAction } from '../uml-metamodel'

export const CallOperationActionHandler = CallOperationAction.createHandler(
  (callOperationAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_operation(callOperationAction)
    addEdge_target(callOperationAction)
  },
)

function addEdge_operation(_callOperationAction: GraphNode) {
  // TODO/Association
  // operation : Operation [1..1] (opposite A_operation_callOperationAction::callOperationAction)
  // The Operation being invoked.
}

function addEdge_target(_callOperationAction: GraphNode) {
  // TODO/Association
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_callOperationAction::callOperationAction)
  // The InputPin that provides the target object to which the Operation call request is sent.
}
