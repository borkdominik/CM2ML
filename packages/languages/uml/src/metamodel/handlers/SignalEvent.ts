import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/fromAttribute'
import { SignalEvent } from '../uml-metamodel'

export const SignalEventHandler = SignalEvent.createHandler(
  (signalEvent, { onlyContainmentAssociations }) => {
    const signal = resolveFromAttribute(signalEvent, 'signal')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(signalEvent, signal)
  },
)

function addEdge_signal(signalEvent: GraphNode, signal: GraphNode | undefined) {
  // TODO/Association
  // signal : Signal [1..1] (opposite A_signal_signalEvent::signalEvent)
  // The specific Signal that is associated with this SignalEvent.
  if (!signal) {
    return
  }
  signalEvent.model.addEdge('signal', signalEvent, signal)
}
