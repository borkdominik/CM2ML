import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { Dependency, NamedElement } from '../uml-metamodel'

export const DependencyHandler = Dependency.createHandler(
  (
    dependency: GraphNode,
    { onlyContainmentAssociations, relationshipsAsEdges },
  ) => {
    // TODO/Jan: Handle multiple clients/suppliers
    const client = resolve(dependency, 'client', { type: NamedElement })
    const supplier = resolve(dependency, 'supplier', { type: NamedElement })
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

function addEdge_client(dependency: GraphNode, client: GraphNode | undefined) {
  // client : NamedElement [1..*]{subsets DirectedRelationship::source} (opposite NamedElement::clientDependency)
  if (!client) {
    return
  }
  dependency.model.addEdge('client', dependency, client)
}

function addEdge_supplier(dependency: GraphNode, supplier: GraphNode | undefined) {
  // supplier : NamedElement [1..*]{subsets DirectedRelationship::target} (opposite A_supplier_supplierDependency::supplierDependency)
  if (!supplier) {
    return
  }
  dependency.model.addEdge('supplier', dependency, supplier)
}
