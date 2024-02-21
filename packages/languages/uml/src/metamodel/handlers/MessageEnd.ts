import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { MessageEnd } from '../uml-metamodel'

export const MessageEndHandler = MessageEnd.createHandler(
  (messageEnd, { onlyContainmentAssociations }) => {
    const message = resolveFromAttribute(messageEnd, 'message')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_message(messageEnd, message)
  },
)

function addEdge_message(messageEnd: GraphNode, message: GraphNode | undefined) {
  // TODO/Association
  // message : Message [0..1] (opposite A_message_messageEnd::messageEnd)
  // References a Message.
  if (!message) {
    return
  }
  messageEnd.model.addEdge('message', messageEnd, message)
}
