import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Connector, Interaction, Message, MessageEnd, NamedElement } from '../uml-metamodel'

export const MessageHandler = Message.createHandler(
  (message, { onlyContainmentAssociations }) => {
    const connector = resolve(message, 'connector', { type: Connector })
    const interaction = resolve(message, 'interaction', { type: Interaction })
    const receiveEvent = resolve(message, 'receiveEvent', { type: MessageEnd })
    const sendEvent = resolve(message, 'sendEvent', { type: MessageEnd })
    const signature = resolve(message, 'signature', { type: NamedElement })
    deriveAttribute_messageKind(message, sendEvent, receiveEvent)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_argument(message)
    addEdge_connector(message, connector)
    addEdge_interaction(message, interaction)
    addEdge_receiveEvent(message, receiveEvent)
    addEdge_sendEvent(message, sendEvent)
    addEdge_signature(message, signature)
  },
  {
    [Uml.Attributes.messageKind]: { type: 'category' },
    [Uml.Attributes.messageSort]: { type: 'category', defaultValue: 'synchCall' },
  },
)

function deriveAttribute_messageKind(message: GraphNode, sendEvent: GraphNode | undefined, receiveEvent: GraphNode | undefined) {
  function getMessageKind() {
    if (sendEvent && receiveEvent) {
      return 'complete'
    }
    if (sendEvent) {
      return 'lost'
    }
    if (receiveEvent) {
      return 'found'
    }
    return 'unknown'
  }
  const value = getMessageKind()
  message.addAttribute({ name: Uml.Attributes.messageKind, type: 'category', value: { literal: value } })
}

function addEdge_argument(_message: GraphNode) {
  // TODO/Association
  // ♦ argument : ValueSpecification [0..*]{ordered, subsets Element::ownedElement} (opposite A_argument_message::message)
  // The arguments of the Message.
}

function addEdge_connector(message: GraphNode, connector: GraphNode | undefined) {
  // connector : Connector [0..1] (opposite A_connector_message::message)
  // The Connector on which this Message is sent.
  if (!connector) {
    return
  }
  message.model.addEdge('connector', message, connector)
}

function addEdge_interaction(message: GraphNode, interaction: GraphNode | undefined) {
  // interaction : Interaction [1..1]{subsets NamedElement::namespace} (opposite Interaction::message)
  // The enclosing Interaction owning the Message.
  if (!interaction) {
    return
  }
  message.model.addEdge('interaction', message, interaction)
}

function addEdge_receiveEvent(message: GraphNode, receiveEvent: GraphNode | undefined) {
  // receiveEvent : MessageEnd [0..1]{subsets A_message_messageEnd::messageEnd} (opposite A_receiveEvent_endMessage::endMessage)
  // References the Receiving of the Message.
  if (!receiveEvent) {
    return
  }
  message.model.addEdge('receiveEvent', message, receiveEvent)
}

function addEdge_sendEvent(message: GraphNode, sendEvent: GraphNode | undefined) {
  // sendEvent : MessageEnd [0..1]{subsets A_message_messageEnd::messageEnd} (opposite A_sendEvent_endMessage::endMessage)
  // References the Sending of the Message.
  if (!sendEvent) {
    return
  }
  message.model.addEdge('sendEvent', message, sendEvent)
}

function addEdge_signature(message: GraphNode, signature: GraphNode | undefined) {
  // signature : NamedElement [0..1] (opposite A_signature_message::message)
  // The signature of the Message is the specification of its content. It refers either an Operation or a Signal.
  if (!signature) {
    return
  }
  message.model.addEdge('signature', message, signature)
}
