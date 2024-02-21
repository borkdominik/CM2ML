import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { SendSignalAction } from '../uml-metamodel'

export const SendSignalActionHandler = SendSignalAction.createHandler(
  (sendSignalAction, { onlyContainmentAssociations }) => {
    const signal = resolveFromAttribute(sendSignalAction, 'signal')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(sendSignalAction, signal)
    addEdge_target(sendSignalAction)
  },
)

function addEdge_signal(sendSignalAction: GraphNode, signal: GraphNode | undefined) {
  // signal : Signal [1..1] (opposite A_signal_sendSignalAction::sendSignalAction)
  // The Signal whose instance is transmitted to the target.
  if (!signal) {
    return
  }
  sendSignalAction.model.addEdge('signal', sendSignalAction, signal)
}

function addEdge_target(_sendSignalAction: GraphNode) {
  // TODO/Association
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_sendSignalAction::sendSignalAction)
  // The InputPin that provides the target object to which the Signal instance is sent.
}
