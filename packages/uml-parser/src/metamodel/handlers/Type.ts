import type { GraphNode } from '@cm2ml/ir'

import { Package, Type, getParentOfType } from '../metamodel'

export const TypeHandler = Type.createHandler((type) => {
  addEdge_package(type)
})

function addEdge_package(type: GraphNode) {
  const package_ = getParentOfType(type, Package)
  if (!package_) {
    return
  }
  type.model.addEdge('package', type, package_)
  // TODO/Investigate: Set reverse direction here instead of in package? -> Issue of nested types with current approach
}
