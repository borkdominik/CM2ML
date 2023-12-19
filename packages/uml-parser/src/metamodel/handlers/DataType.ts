import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { DataType, Operation, Property } from '../metamodel'

export const DataTypeHandler = DataType.createHandler((dataType) => {
  dataType.children.forEach((child) => {
    addEdge_ownedAttribute(dataType, child)
    addEdge_ownedOperation(dataType, child)
  })
})

function addEdge_ownedAttribute(dataType: GraphNode, child: GraphNode) {
  if (Property.isAssignable(child)) {
    dataType.model.addEdge(Uml.Tags.ownedAttribute, dataType, child)
  }
}

function addEdge_ownedOperation(dataType: GraphNode, child: GraphNode) {
  if (Operation.isAssignable(child)) {
    dataType.model.addEdge(Uml.Tags.ownedOperation, dataType, child)
  }
}
