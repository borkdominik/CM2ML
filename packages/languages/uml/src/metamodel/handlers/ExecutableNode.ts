import type { GraphNode } from '@cm2ml/ir'

import { ExecutableNode } from '../uml-metamodel'

export const ExecutableNodeHandler = ExecutableNode.createHandler(
  (executableNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_handler(executableNode)
  },
)

function addEdge_handler(_executableNode: GraphNode) {
  // TODO/Association
  // ♦ handler : ExceptionHandler [0..*]{subsets Element::ownedElement} (opposite ExceptionHandler::protectedNode)
  // A set of ExceptionHandlers that are examined if an exception propagates out of the ExceptionNode.
}
