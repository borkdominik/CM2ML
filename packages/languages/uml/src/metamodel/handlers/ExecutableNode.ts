import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ExceptionHandler, ExecutableNode } from '../uml-metamodel'

export const ExecutableNodeHandler = ExecutableNode.createHandler(
  (executableNode, { onlyContainmentAssociations }) => {
    const handlers = resolve(executableNode, 'handler', { many: true, type: ExceptionHandler })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_handler(executableNode, handlers)
  },
)

function addEdge_handler(executableNode: GraphNode, handlers: GraphNode[]) {
  // ♦ handler : ExceptionHandler [0..*]{subsets Element::ownedElement} (opposite ExceptionHandler::protectedNode)
  // A set of ExceptionHandlers that are examined if an exception propagates out of the ExceptionNode.
  handlers.forEach((handler) => {
    executableNode.model.addEdge('handler', executableNode, handler)
  })
}
