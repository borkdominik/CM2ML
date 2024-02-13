import type { GraphNode } from '@cm2ml/ir'

import { ExceptionHandler } from '../uml-metamodel'

export const ExceptionHandlerHandler = ExceptionHandler.createHandler(
  (exceptionHandler, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_exceptionInput(exceptionHandler)
    addEdge_exceptionType(exceptionHandler)
    addEdge_handlerBody(exceptionHandler)
    addEdge_protectedNode(exceptionHandler)
  },
)
function addEdge_exceptionInput(_exceptionHandler: GraphNode) {
  // TODO/Association
  // exceptionInput : ObjectNode [1..1] (opposite A_exceptionInput_exceptionHandler::exceptionHandler)
  // An ObjectNode within the handlerBody. When the ExceptionHandler catches an exception, the exception token is placed on this ObjectNode, causing the handlerBody to execute.
}

function addEdge_exceptionType(_exceptionHandler: GraphNode) {
  // TODO/Association
  // exceptionType : Classifier [1..*] (opposite A_exceptionType_exceptionHandler::exceptionHandler)
  // The Classifiers whose instances the ExceptionHandler catches as exceptions. If an exception occurs whose type is any exceptionType, the ExceptionHandler catches the exception and executes the handlerBody.
}

function addEdge_handlerBody(_exceptionHandler: GraphNode) {
  // TODO/Association
  // handlerBody : ExecutableNode [1..1] (opposite A_handlerBody_exceptionHandler::exceptionHandler)
  // An ExecutableNode that is executed if the ExceptionHandler catches an exception.
}

function addEdge_protectedNode(_exceptionHandler: GraphNode) {
  // TODO/Association
  // protectedNode : ExecutableNode [1..1]{subsets Element::owner} (opposite ExecutableNode::handler)
  // The ExecutableNode protected by the ExceptionHandler. If an exception propagates out of the protectedNode and has a type matching one of the exceptionTypes, then it is caught by this ExceptionHandler.
}
