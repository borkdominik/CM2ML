import type { GraphNode } from '@cm2ml/ir'

import { EncapsulatedClassifier } from '../metamodel'

export const EncapsulatedClassifierHandler =
  EncapsulatedClassifier.createHandler(
    (encapsulatedClassifier, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_ownedPort(encapsulatedClassifier)
    },
  )

function addEdge_ownedPort(_encapsulatedClassifier: GraphNode) {
  // TODO
  // ♦ /ownedPort : Port [0..*]{subsets StructuredClassifier::ownedAttribute} (opposite A_ownedPort_encapsulatedClassifier::encapsulatedClassifier )
  // The Ports owned by the EncapsulatedClassifier.
}
