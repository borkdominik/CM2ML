import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { EncapsulatedClassifier, Port, Property } from '../uml-metamodel'

export const EncapsulatedClassifierHandler =
  EncapsulatedClassifier.createHandler(
    (encapsulatedClassifier, { onlyContainmentAssociations }) => {
      const ownedPorts = resolve(encapsulatedClassifier, 'ownedAttribute', { many: true, type: Property }).filter((ownedAttribute) => Port.isAssignable(ownedAttribute))
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_ownedPort(encapsulatedClassifier, ownedPorts)
    },
  )

function addEdge_ownedPort(encapsulatedClassifier: GraphNode, ownedPorts: GraphNode[]) {
  // ♦ /ownedPort : Port [0..*]{subsets StructuredClassifier::ownedAttribute} (opposite A_ownedPort_encapsulatedClassifier::encapsulatedClassifier )
  // The Ports owned by the EncapsulatedClassifier.
  ownedPorts.forEach((ownedPort) => {
    encapsulatedClassifier.model.addEdge('ownedPort', encapsulatedClassifier, ownedPort)
  })
}
