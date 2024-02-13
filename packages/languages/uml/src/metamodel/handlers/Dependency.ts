import type { GraphNode } from '@cm2ml/ir'
import { transformNodeToEdge } from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/fromAttribute'
import { Uml } from '../uml'
import { Dependency } from '../uml-metamodel'

export const DependencyHandler = Dependency.createHandler(
  (
    dependency: GraphNode,
    { onlyContainmentAssociations, relationshipsAsEdges },
  ) => {
    // TODO/Jan: Add type config
    const client = resolveFromAttribute(dependency, 'client', { required: true })
    const supplier = resolveFromAttribute(dependency, 'supplier', { required: true })
    if (relationshipsAsEdges) {
      const edgeTag = Uml.getEdgeTagForRelationship(dependency)
      transformNodeToEdge(dependency, client, supplier, edgeTag)
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_client(dependency, client)
    addEdge_supplier(dependency, supplier)
  },
)

function addEdge_client(dependency: GraphNode, client: GraphNode) {
  dependency.model.addEdge('client', dependency, client)
}

function addEdge_supplier(dependency: GraphNode, supplier: GraphNode) {
  dependency.model.addEdge('supplier', dependency, supplier)
}
