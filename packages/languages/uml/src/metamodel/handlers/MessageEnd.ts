import type { GraphNode } from '@cm2ml/ir'

import { MessageEnd } from '../uml-metamodel'

export const MessageEndHandler = MessageEnd.createHandler(
  (messageEnd, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_message(messageEnd)
  },
)

function addEdge_message(_messageEnd: GraphNode) {
  // TODO/Association
  // message : Message [0..1] (opposite A_message_messageEnd::messageEnd)
  // References a Message.
}
