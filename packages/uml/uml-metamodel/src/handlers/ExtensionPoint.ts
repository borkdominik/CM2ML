import type { GraphNode } from '@cm2ml/ir'

import { ExtensionPoint } from '../uml-metamodel'

export const ExtensionPointHandler = ExtensionPoint.createHandler(
  (extensionPoint, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_useCase(extensionPoint)
  },
)

function addEdge_useCase(_extensionPoint: GraphNode) {
  // TODO/Association
  // useCase : UseCase [1..1]{subsets NamedElement::namespace} (opposite UseCase::extensionPoint)
  // The UseCase that owns this ExtensionPoint.
}
