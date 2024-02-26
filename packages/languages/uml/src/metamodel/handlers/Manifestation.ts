import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Manifestation, PackageableElement } from '../uml-metamodel'

export const ManifestationHandler = Manifestation.createHandler(
  (manifestation, { onlyContainmentAssociations }) => {
    const utilizedElement = resolveFromAttribute(manifestation, 'utilizedElement', { type: PackageableElement })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_utilizedElement(manifestation, utilizedElement)
  },
)

function addEdge_utilizedElement(manifestation: GraphNode, utilizedElement: GraphNode | undefined) {
  // utilizedElement : PackageableElement [1..1]{subsets Dependency::supplier} (opposite A_utilizedElement_manifestation::manifestation)
  // The model element that is utilized in the manifestation in an Artifact.
  if (!utilizedElement) {
    return
  }
  manifestation.model.addEdge('utilizedElement', manifestation, utilizedElement)
}
