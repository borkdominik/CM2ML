import type { GraphNode } from '@cm2ml/ir'

import { SendObjectAction } from '../uml-metamodel'

export const SendObjectActionHandler = SendObjectAction.createHandler(
  (sendObjectAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_request(sendObjectAction)
    addEdge_target(sendObjectAction)
  },
)
function addEdge_request(_sendObjectAction: GraphNode) {
  // TODO/Association
  // ♦ request : InputPin [1..1]{redefines InvocationAction::argument} (opposite A_request_sendObjectAction::sendObjectAction)
  // The request object, which is transmitted to the target object. The object may be copied in transmission, so identity might not be preserved.
}

function addEdge_target(_sendObjectAction: GraphNode) {
  // TODO/Association
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_sendObjectAction::sendObjectAction)
  // The target object to which the object is sent.
}
