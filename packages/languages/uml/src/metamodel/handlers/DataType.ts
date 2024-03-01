import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { DataType, Operation, Property } from '../uml-metamodel'

export const DataTypeHandler = DataType.createHandler(
  (dataType, { onlyContainmentAssociations }) => {
    const ownedAttributes = resolve(dataType, 'ownedAttribute', { many: true, type: Property })
    const ownedOperations = resolve(dataType, 'ownedOperation', { many: true, type: Operation })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedAttribute(dataType, ownedAttributes)
    addEdge_ownedOperation(dataType, ownedOperations)
  },
)

function addEdge_ownedAttribute(dataType: GraphNode, ownedAttributes: GraphNode[]) {
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets Namespace::ownedMember} (opposite Property::datatype)
  // The attributes owned by the DataType.
  ownedAttributes.forEach((ownedAttribute) => {
    dataType.model.addEdge('ownedAttribute', dataType, ownedAttribute)
  })
}

function addEdge_ownedOperation(dataType: GraphNode, ownedOperations: GraphNode[]) {
  // ♦ ownedOperation : Operation [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite Operation::datatype)
  // The Operations owned by the DataType.
  ownedOperations.forEach((ownedOperation) => {
    dataType.model.addEdge('ownedOperation', dataType, ownedOperation)
    ownedOperation.model.addEdge('datatype', ownedOperation, dataType)
  })
}
