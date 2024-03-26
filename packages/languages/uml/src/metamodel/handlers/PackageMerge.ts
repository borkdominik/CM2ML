import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
} from '@cm2ml/metamodel'

import { addEdge_relatedElement } from '../resolvers/relatedElement'
import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { Package, PackageMerge } from '../uml-metamodel'

export const PackageMergeHandler = PackageMerge.createHandler(
  (packageMerge, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const receivingPackage = getParentOfType(packageMerge, Package)
    const mergedPackage = resolve(packageMerge, 'mergedPackage', { type: Package })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(packageMerge, receivingPackage, mergedPackage)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_mergedPackage(packageMerge, mergedPackage)
    addEdge_receivingPackage(packageMerge, receivingPackage)
    addEdge_relatedElement(packageMerge, receivingPackage, mergedPackage)
  },
)

function addEdge_mergedPackage(packageMerge: GraphNode, mergedPackage: GraphNode | undefined) {
  // mergedPackage : Package [1..1]{subsets DirectedRelationship::target} (opposite A_mergedPackage_packageMerge::packageMerge )
  // References the Package that is to be merged with the receiving package of the PackageMerge.
  if (!mergedPackage) {
    return
  }
  packageMerge.model.addEdge('mergedPackage', packageMerge, mergedPackage)
  packageMerge.model.addEdge('target', packageMerge, mergedPackage)
}

function addEdge_receivingPackage(packageMerge: GraphNode, receivingPackage: GraphNode | undefined) {
  // receivingPackage : Package [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Package::packageMerge)
  // References the Package that is being extended with the contents of the merged package of the PackageMerge.
  if (!receivingPackage) {
    return
  }
  packageMerge.model.addEdge('receivingPackage', packageMerge, receivingPackage)
  packageMerge.model.addEdge('source', packageMerge, receivingPackage)
}
