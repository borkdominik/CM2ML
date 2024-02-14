import type { GraphNode } from '@cm2ml/ir'
import {
  requireImmediateParentOfType,
  transformNodeToEdge,
} from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Package, PackageMerge } from '../uml-metamodel'

export const PackageMergeHandler = PackageMerge.createHandler(
  (packageMerge, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const receivingPackage = getReceivingPackage(packageMerge)
    const mergedPackage = resolveFromAttribute(packageMerge, 'mergedPackage', { type: Package })
    if (relationshipsAsEdges) {
      const edgeTag = Uml.getEdgeTagForRelationship(packageMerge)
      transformNodeToEdge(
        packageMerge,
        receivingPackage,
        mergedPackage,
        edgeTag,
      )
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_mergedPackage(packageMerge, mergedPackage)
    addEdge_receivingPackage(packageMerge, receivingPackage)
  },
)

function getReceivingPackage(packageMerge: GraphNode) {
  return requireImmediateParentOfType(packageMerge, Package)
}

function addEdge_mergedPackage(packageMerge: GraphNode, mergedPackage: GraphNode | undefined) {
  if (!mergedPackage) {
    return
  }
  packageMerge.model.addEdge('mergedPackage', packageMerge, mergedPackage)
}

function addEdge_receivingPackage(packageMerge: GraphNode, receivingPackage: GraphNode) {
  packageMerge.model.addEdge('receivingPackage', packageMerge, receivingPackage)
}
