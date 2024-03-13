import type { GraphNode } from '@cm2ml/ir'

import { addEdge_relatedElement } from '../resolvers/relatedElement'
import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { Dependency, NamedElement } from '../uml-metamodel'

export const DependencyHandler = Dependency.createHandler(
  (
    dependency: GraphNode,
    { onlyContainmentAssociations, relationshipsAsEdges },
  ) => {
    const clients = resolve(dependency, 'client', { many: true, type: NamedElement })
    const suppliers = resolve(dependency, 'supplier', { many: true, type: NamedElement })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(dependency, clients, suppliers)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_client(dependency, clients)
    addEdge_supplier(dependency, suppliers)
    addEdge_relatedElement(dependency, ...clients, ...suppliers)
  },
)

function addEdge_client(dependency: GraphNode, clients: GraphNode[]) {
  // client : NamedElement [1..*]{subsets DirectedRelationship::source} (opposite NamedElement::clientDependency)
  clients.forEach((namedElement) => {
    dependency.model.addEdge('client', dependency, namedElement)
    dependency.model.addEdge('source', dependency, namedElement)
  })
}

function addEdge_supplier(dependency: GraphNode, suppliers: GraphNode[]) {
  // supplier : NamedElement [1..*]{subsets DirectedRelationship::target} (opposite A_supplier_supplierDependency::supplierDependency)
  suppliers.forEach((namedElement) => {
    dependency.model.addEdge('supplier', dependency, namedElement)
    dependency.model.addEdge('target', dependency, namedElement)
  })
}
