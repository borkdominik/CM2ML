import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { BroadcastSignalAction, Signal } from '../uml-metamodel'

export const BroadcastSignalActionHandler = BroadcastSignalAction.createHandler(
  (broadcastSignalAction, { onlyContainmentAssociations }) => {
    const signal = resolve(broadcastSignalAction, 'signal', { type: Signal })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(broadcastSignalAction, signal)
  },
)

function addEdge_signal(broadcastSignalAction: GraphNode, signal: GraphNode | undefined) {
  // signal : Signal [1..1] (opposite A_signal_broadcastSignalAction::broadcastSignalAction)
  // The Signal whose instances are to be sent.
  if (!signal) {
    return
  }
  broadcastSignalAction.model.addEdge('signal', broadcastSignalAction, signal)
}
