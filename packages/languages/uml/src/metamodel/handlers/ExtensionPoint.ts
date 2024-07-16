import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ExtensionPoint, UseCase } from '../uml-metamodel'

export const ExtensionPointHandler = ExtensionPoint.createHandler(
  (extensionPoint, { onlyContainmentAssociations }) => {
    const useCase = resolve(extensionPoint, 'useCase', { type: UseCase })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_useCase(extensionPoint, useCase)
  },
)

function addEdge_useCase(extensionPoint: GraphNode, useCase: GraphNode | undefined) {
  // useCase : UseCase [1..1]{subsets NamedElement::namespace} (opposite UseCase::extensionPoint)
  // The UseCase that owns this ExtensionPoint.
  if (useCase) {
    extensionPoint.model.addEdge('useCase', extensionPoint, useCase)
  }
}
