import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { Dependency } from '../metamodel'

export const DependencyHandler = Dependency.createHandler((node: GraphNode) => {
  addEdge_client(node)
  addEdge_supplier(node)
})

function addEdge_client(dependency: GraphNode) {
  const clientId = dependency.getAttribute(Uml.Attributes.client)?.value.literal
  if (!clientId) {
    throw new Error('Missing client attribute on dependency')
  }
  const client = dependency.model.getNodeById(clientId)
  if (!client) {
    throw new Error(`Could not find client with id ${clientId} for dependency`)
  }
  dependency.model.addEdge('client', dependency, client)
}

function addEdge_supplier(dependency: GraphNode) {
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
  dependency.model.addEdge('supplier', dependency, supplier)
}
