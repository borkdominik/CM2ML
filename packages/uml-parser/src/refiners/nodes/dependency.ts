import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'

import { PackageableElement } from './packageableElement'

export class Dependency extends PackageableElement {
  public isApplicable(node: GraphNode) {
    return Uml.getType(node) === Uml.Types.Dependency
  }

  public refine(node: GraphNode) {
    super.refine(node)
    const clientId = node.getAttribute(Uml.Attributes.client)?.value.literal
    if (!clientId) {
      throw new Error('Missing client attribute on dependency')
    }
    const client = node.model.getNodeById(clientId)
    if (!client) {
      throw new Error(
        `Could not find client with id ${clientId} for dependency`,
      )
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
  }
}
