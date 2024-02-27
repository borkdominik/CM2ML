import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Classifier, ExceptionHandler, ExecutableNode, ObjectNode } from '../uml-metamodel'

export const ExceptionHandlerHandler = ExceptionHandler.createHandler(
  (exceptionHandler, { onlyContainmentAssociations }) => {
    const exceptionInput = resolve(exceptionHandler, 'exceptionInput', { type: ObjectNode })
    const exceptionTypes = resolve(exceptionHandler, 'exceptionType', { many: true, type: Classifier })
    const handlerBody = resolve(exceptionHandler, 'handlerBody', { type: ExecutableNode })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_exceptionInput(exceptionHandler, exceptionInput)
    addEdge_exceptionType(exceptionHandler, exceptionTypes)
    addEdge_handlerBody(exceptionHandler, handlerBody)
    addEdge_protectedNode(exceptionHandler)
  },
)
function addEdge_exceptionInput(exceptionHandler: GraphNode, exceptionInput: GraphNode | undefined) {
  // exceptionInput : ObjectNode [1..1] (opposite A_exceptionInput_exceptionHandler::exceptionHandler)
  // An ObjectNode within the handlerBody. When the ExceptionHandler catches an exception, the exception token is placed on this ObjectNode, causing the handlerBody to execute.
  if (!exceptionInput) {
    return
  }
  exceptionHandler.model.addEdge('exceptionInput', exceptionHandler, exceptionInput)
}

function addEdge_exceptionType(exceptionHandler: GraphNode, exceptionTypes: GraphNode[]) {
  // exceptionType : Classifier [1..*] (opposite A_exceptionType_exceptionHandler::exceptionHandler)
  // The Classifiers whose instances the ExceptionHandler catches as exceptions. If an exception occurs whose type is any exceptionType, the ExceptionHandler catches the exception and executes the handlerBody.
  exceptionTypes.forEach((exceptionType) => {
    exceptionHandler.model.addEdge('exceptionType', exceptionHandler, exceptionType)
  })
}

function addEdge_handlerBody(exceptionHandler: GraphNode, handlerBody: GraphNode | undefined) {
  // handlerBody : ExecutableNode [1..1] (opposite A_handlerBody_exceptionHandler::exceptionHandler)
  // An ExecutableNode that is executed if the ExceptionHandler catches an exception.
  if (!handlerBody) {
    return
  }
  exceptionHandler.model.addEdge('handlerBody', exceptionHandler, handlerBody)
}

function addEdge_protectedNode(_exceptionHandler: GraphNode) {
  // TODO/Association
  // protectedNode : ExecutableNode [1..1]{subsets Element::owner} (opposite ExecutableNode::handler)
  // The ExecutableNode protected by the ExceptionHandler. If an exception propagates out of the protectedNode and has a type matching one of the exceptionTypes, then it is caught by this ExceptionHandler.
}
