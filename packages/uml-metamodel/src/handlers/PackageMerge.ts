import type { GraphNode } from '@cm2ml/ir'
import {
  requireImmediateParentOfType,
  transformNodeToEdge,
} from '@cm2ml/metamodel'

import { Uml } from '../uml'
import { Package, PackageMerge } from '../uml-metamodel'

export const PackageMergeHandler = PackageMerge.createHandler(
  (PackageMerge, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    if (relationshipsAsEdges) {
      const receivingPackage = getReceivingPackage(PackageMerge)
      const mergedPackage = getMergedPackage(PackageMerge)
      transformNodeToEdge(PackageMerge, receivingPackage, mergedPackage)
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_mergedPackage(PackageMerge)
    addEdge_receivingPackage(PackageMerge)
  },
)

function getMergedPackage(packageMerge: GraphNode) {
  const mergedPackageId = packageMerge.getAttribute(
    Uml.Attributes.mergedPackage,
  )?.value.literal
  if (!mergedPackageId) {
    throw new Error('Missing mergedPackage attribute on PackageMerge')
  }
  const mergedPackage = packageMerge.model.getNodeById(mergedPackageId)
  if (!mergedPackage) {
    throw new Error(
      `Missing mergedPackage with id ${mergedPackageId} for PackageMerge`,
    )
  }
  return mergedPackage
}

function getReceivingPackage(packageMerge: GraphNode) {
  return requireImmediateParentOfType(packageMerge, Package)
}

function addEdge_mergedPackage(packageMerge: GraphNode) {
  const mergedPackage = getMergedPackage(packageMerge)
  packageMerge.model.addEdge('mergedPackage', packageMerge, mergedPackage)
}

function addEdge_receivingPackage(packageMerge: GraphNode) {
  const receivingPackage = getReceivingPackage(packageMerge)
  packageMerge.model.addEdge('receivingPackage', packageMerge, receivingPackage)
}
