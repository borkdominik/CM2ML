import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Message } from '../uml-metamodel'

export const MessageHandler = Message.createHandler(
  (message, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_argument(message)
    addEdge_connector(message)
    addEdge_interaction(message)
    addEdge_receiveEvent(message)
    addEdge_sendEvent(message)
    addEdge_signature(message)
  },
  {
    [Uml.Attributes.messageSort]: 'synchCall',
  },
)

function addEdge_argument(_message: GraphNode) {
  // TODO/Association
  // ♦ argument : ValueSpecification [0..*]{ordered, subsets Element::ownedElement} (opposite A_argument_message::message)
  // The arguments of the Message.
}

function addEdge_connector(_message: GraphNode) {
  // TODO/Association
  // connector : Connector [0..1] (opposite A_connector_message::message)
  // The Connector on which this Message is sent.
}

function addEdge_interaction(_message: GraphNode) {
  // TODO/Association
  // interaction : Interaction [1..1]{subsets NamedElement::namespace} (opposite Interaction::message)
  // The enclosing Interaction owning the Message.
}

function addEdge_receiveEvent(_message: GraphNode) {
  // TODO/Association
  // receiveEvent : MessageEnd [0..1]{subsets A_message_messageEnd::messageEnd} (opposite A_receiveEvent_endMessage::endMessage)
  // References the Receiving of the Message.
}

function addEdge_sendEvent(_message: GraphNode) {
  // TODO/Association
  // sendEvent : MessageEnd [0..1]{subsets A_message_messageEnd::messageEnd} (opposite A_sendEvent_endMessage::endMessage)
  // References the Sending of the Message.
}

function addEdge_signature(_message: GraphNode) {
  // TODO/Association
  // signature : NamedElement [0..1] (opposite A_signature_message::message)
  // The signature of the Message is the specification of its content. It refers either an Operation or a Signal.
}
