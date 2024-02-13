import type { GraphNode } from '@cm2ml/ir'

import { SendSignalAction } from '../uml-metamodel'

export const SendSignalActionHandler = SendSignalAction.createHandler(
  (sendSignalAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_signal(sendSignalAction)
    addEdge_target(sendSignalAction)
  },
)

function addEdge_signal(_sendSignalAction: GraphNode) {
  // TODO/Association
  // signal : Signal [1..1] (opposite A_signal_sendSignalAction::sendSignalAction)
  // The Signal whose instance is transmitted to the target.
}

function addEdge_target(_sendSignalAction: GraphNode) {
  // TODO/Association
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_sendSignalAction::sendSignalAction)
  // The InputPin that provides the target object to which the Signal instance is sent.
}
