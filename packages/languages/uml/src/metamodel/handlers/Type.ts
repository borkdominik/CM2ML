import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { Package, Type } from '../uml-metamodel'

export const TypeHandler = Type.createHandler(
  (type, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_package(type)
  },
)

function addEdge_package(type: GraphNode) {
  const package_ = getParentOfType(type, Package)
  if (!package_) {
    return
  }
  type.model.addEdge('package', type, package_)
  // TODO/Investigate: Set reverse direction here instead of in package? -> Issue of nested types with current approach
}
