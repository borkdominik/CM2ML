import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { PackageMerge } from '../metamodel'

export const PackageMergeHandler = PackageMerge.createHandler(
  (PackageMerge) => {
    addEdge_mergedPackage(PackageMerge)
    addEdge_receivingPackage(PackageMerge)
  },
)

function addEdge_mergedPackage(packageMerge: GraphNode) {
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
  packageMerge.model.addEdge('mergedPackage', packageMerge, mergedPackage)
}

function addEdge_receivingPackage(packageMerge: GraphNode) {
  const parent = packageMerge.parent
  if (!parent) {
    throw new Error('Missing parent for PackageMerge')
  }
  packageMerge.model.addEdge('receivingPackage', packageMerge, parent)
}
