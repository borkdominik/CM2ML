import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { CallOperationAction, InputPin, Operation } from '../uml-metamodel'

export const CallOperationActionHandler = CallOperationAction.createHandler(
  (callOperationAction, { onlyContainmentAssociations }) => {
    const operation = resolve(callOperationAction, 'operation', { type: Operation })
    const target = resolve(callOperationAction, 'target', { type: InputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_operation(callOperationAction, operation)
    addEdge_target(callOperationAction, target)
  },
)

function addEdge_operation(callOperationAction: GraphNode, operation: GraphNode | undefined) {
  // operation : Operation [1..1] (opposite A_operation_callOperationAction::callOperationAction)
  // The Operation being invoked.
  if (!operation) {
    return
  }
  callOperationAction.model.addEdge('operation', callOperationAction, operation)
}

function addEdge_target(callOperationAction: GraphNode, target: GraphNode | undefined) {
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_callOperationAction::callOperationAction)
  // The InputPin that provides the target object to which the Operation call request is sent.
  if (!target) {
    return
  }
  callOperationAction.model.addEdge('target', callOperationAction, target)
}
