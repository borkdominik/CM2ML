import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { Dependency, NamedElement } from '../uml-metamodel'

export const DependencyHandler = Dependency.createHandler(
  (
    dependency: GraphNode,
    { onlyContainmentAssociations, relationshipsAsEdges },
  ) => {
    const client = resolve(dependency, 'client', { many: true, type: NamedElement })
    const supplier = resolve(dependency, 'supplier', { many: true, type: NamedElement })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(dependency, client, supplier)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_client(dependency, client)
    addEdge_supplier(dependency, supplier)
  },
)

function addEdge_client(dependency: GraphNode, clients: GraphNode[]) {
  // client : NamedElement [1..*]{subsets DirectedRelationship::source} (opposite NamedElement::clientDependency)
  clients.forEach((namedElement) => {
    dependency.model.addEdge('client', dependency, namedElement)
    dependency.model.addEdge('source', dependency, namedElement)
    dependency.model.addEdge('relatedElement', dependency, namedElement)
  })
}

function addEdge_supplier(dependency: GraphNode, suppliers: GraphNode[]) {
  // supplier : NamedElement [1..*]{subsets DirectedRelationship::target} (opposite A_supplier_supplierDependency::supplierDependency)
  suppliers.forEach((namedElement) => {
    dependency.model.addEdge('supplier', dependency, namedElement)
    dependency.model.addEdge('target', dependency, namedElement)
    dependency.model.addEdge('relatedElement', dependency, namedElement)
  })
}
