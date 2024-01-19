import type { GraphNode } from '@cm2ml/ir'

import { Manifestation } from '../uml-metamodel'

export const ManifestationHandler = Manifestation.createHandler(
  (manifestation, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_utilizedElement(manifestation)
  },
)

function addEdge_utilizedElement(_manifestation: GraphNode) {
  // TODO/Association
  // utilizedElement : PackageableElement [1..1]{subsets Dependency::supplier} (opposite A_utilizedElement_manifestation::manifestation)
  // The model element that is utilized in the manifestation in an Artifact.
}
