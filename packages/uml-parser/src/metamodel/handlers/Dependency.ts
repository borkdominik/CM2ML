import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { Dependency } from '../metamodel'

export const DependencyHandler = Dependency.createHandler((node: GraphNode) => {
  const clientId = node.getAttribute(Uml.Attributes.client)?.value.literal
  if (!clientId) {
    throw new Error('Missing client attribute on dependency')
  }
  const client = node.model.getNodeById(clientId)
  if (!client) {
    throw new Error(`Could not find client with id ${clientId} for dependency`)
  }
  const supplierId = node.getAttribute(Uml.Attributes.supplier)?.value.literal
  if (!supplierId) {
    throw new Error('Missing supplier attribute on dependency')
  }
  const supplier = node.model.getNodeById(supplierId)
  if (!supplier) {
    throw new Error(
      `Could not find supplier with id ${supplierId} for dependency`,
    )
  }
  // TODO: Update tag
  node.model.addEdge('dependency', client, supplier)
})
