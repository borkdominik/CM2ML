import type { GraphNode } from '@cm2ml/ir'

import { Uml, transformNodeToEdge } from '../../uml'
import { Dependency } from '../metamodel'

export const DependencyHandler = Dependency.createHandler(
  (
    dependency: GraphNode,
    { nodeAsEdgeTag, onlyContainmentAssociations, relationshipsAsEdges },
  ) => {
    if (relationshipsAsEdges) {
      const client = getClient(dependency)
      const supplier = getSupplier(dependency)
      transformNodeToEdge(
        dependency,
        client,
        supplier,
        nodeAsEdgeTag ?? 'dependency',
      )
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_client(dependency)
    addEdge_supplier(dependency)
  },
)

function getClient(dependency: GraphNode) {
  const clientId = dependency.getAttribute(Uml.Attributes.client)?.value.literal
  if (!clientId) {
    throw new Error('Missing client attribute on dependency')
  }
  const client = dependency.model.getNodeById(clientId)
  if (!client) {
    throw new Error(`Could not find client with id ${clientId} for dependency`)
  }
  return client
}

function getSupplier(dependency: GraphNode) {
  const supplierId = dependency.getAttribute(Uml.Attributes.supplier)?.value
    .literal
  if (!supplierId) {
    throw new Error('Missing supplier attribute on dependency')
  }
  const supplier = dependency.model.getNodeById(supplierId)
  if (!supplier) {
    throw new Error(
      `Could not find supplier with id ${supplierId} for dependency`,
    )
  }
  return supplier
}

function addEdge_client(dependency: GraphNode) {
  const client = getClient(dependency)
  dependency.model.addEdge('client', dependency, client)
}

function addEdge_supplier(dependency: GraphNode) {
  const supplier = getSupplier(dependency)
  dependency.model.addEdge('supplier', dependency, supplier)
}
