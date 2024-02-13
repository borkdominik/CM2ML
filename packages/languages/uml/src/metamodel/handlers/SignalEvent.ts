import type { GraphNode } from '@cm2ml/ir'

import { SignalEvent } from '../uml-metamodel'

export const SignalEventHandler = SignalEvent.createHandler(
  (signalEvent, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(signalEvent)
  },
)

function addEdge_signal(_signalEvent: GraphNode) {
  // TODO/Association
  // signal : Signal [1..1] (opposite A_signal_signalEvent::signalEvent)
  // The specific Signal that is associated with this SignalEvent.
}
