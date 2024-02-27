import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Message, MessageEnd } from '../uml-metamodel'

export const MessageEndHandler = MessageEnd.createHandler(
  (messageEnd, { onlyContainmentAssociations }) => {
    const message = resolve(messageEnd, 'message', { type: Message })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_message(messageEnd, message)
  },
)

function addEdge_message(messageEnd: GraphNode, message: GraphNode | undefined) {
  // message : Message [0..1] (opposite A_message_messageEnd::messageEnd)
  // References a Message.
  if (!message) {
    return
  }
  messageEnd.model.addEdge('message', messageEnd, message)
}
