import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
} from '@cm2ml/metamodel'

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
  },
)

function addEdge_mergedPackage(packageMerge: GraphNode, mergedPackage: GraphNode | undefined) {
  if (!mergedPackage) {
    return
  }
  packageMerge.model.addEdge('mergedPackage', packageMerge, mergedPackage)
}

function addEdge_receivingPackage(packageMerge: GraphNode, receivingPackage: GraphNode | undefined) {
  if (!receivingPackage) {
    return
  }
  packageMerge.model.addEdge('receivingPackage', packageMerge, receivingPackage)
}
