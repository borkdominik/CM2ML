import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { CallEvent, Operation } from '../uml-metamodel'

export const CallEventHandler = CallEvent.createHandler(
  (callEvent, { onlyContainmentAssociations }) => {
    const operation = resolve(callEvent, 'operation', { type: Operation })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_operation(callEvent, operation)
  },
)

function addEdge_operation(callEvent: GraphNode, operation: GraphNode | undefined) {
  // operation : Operation [1..1] (opposite A_operation_callEvent::callEvent)
  // Designates the Operation whose invocation raised the CalEvent.
  if (!operation) {
    return
  }
  callEvent.model.addEdge('operation', callEvent, operation)
}
