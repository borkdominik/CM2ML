import type { GraphNode } from '@cm2ml/ir'

import { DataType, Operation, Property } from '../metamodel'

export const DataTypeHandler = DataType.createHandler(
  (dataType, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    dataType.children.forEach((child) => {
      addEdge_ownedAttribute(dataType, child)
      addEdge_ownedOperation(dataType, child)
    })
  },
)

function addEdge_ownedAttribute(dataType: GraphNode, child: GraphNode) {
  if (Property.isAssignable(child)) {
    dataType.model.addEdge('ownedAttribute', dataType, child)
  }
}

function addEdge_ownedOperation(dataType: GraphNode, child: GraphNode) {
  if (Operation.isAssignable(child)) {
    dataType.model.addEdge('ownedOperations', dataType, child)
  }
}
