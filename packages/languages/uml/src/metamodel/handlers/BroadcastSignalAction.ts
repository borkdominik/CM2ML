import type { GraphNode } from '@cm2ml/ir'

import { BroadcastSignalAction } from '../uml-metamodel'

export const BroadcastSignalActionHandler = BroadcastSignalAction.createHandler(
  (broadcastSignalAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(broadcastSignalAction)
  },
)

function addEdge_signal(_broadcastSignalAction: GraphNode) {
  // TODO/Association
  // signal : Signal [1..1] (opposite A_signal_broadcastSignalAction::broadcastSignalAction)
  // The Signal whose instances are to be sent.
}
