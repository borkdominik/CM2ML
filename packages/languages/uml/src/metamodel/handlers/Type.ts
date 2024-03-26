import type { GraphNode } from '@cm2ml/ir'

import { Type } from '../uml-metamodel'

export const TypeHandler = Type.createHandler(
  (type, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_package(type)
  },
)

function addEdge_package(_type: GraphNode) {
  // package : Package [0..1]{subsets A_packagedElement_owningPackage::owningPackage} (opposite Package::ownedType)
  // Specifies the owning Package of this Type, if any.

  // Added by PackageHandler::addEdge_ownedType
}
