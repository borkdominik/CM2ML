import type { GraphNode } from '@cm2ml/ir'

import { CallEvent } from '../uml-metamodel'

export const CallEventHandler = CallEvent.createHandler(
  (callEvent, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_operation(callEvent)
  },
)

function addEdge_operation(_callEvent: GraphNode) {
  // TODO/Association
  // operation : Operation [1..1] (opposite A_operation_callEvent::callEvent)
  // Designates the Operation whose invocation raised the CalEvent.
}
