import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { Substitution } from '../metamodel'

export const SubstitutionHandler = Substitution.createHandler(
  (substitution, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(substitution)
    addEdge_substitutingClassifier(substitution)
  },
)

function addEdge_contract(substitution: GraphNode) {
  const supplierId = substitution.getAttribute(Uml.Attributes.supplier)?.value
    .literal
  if (!supplierId) {
    throw new Error('Missing supplier attribute on Substitution')
  }
  const supplier = substitution.model.getNodeById(supplierId)
  if (!supplier) {
    throw new Error(`Missing supplier with id ${supplierId} for Substitution`)
  }
  substitution.model.addEdge('contract', substitution, supplier)
}

function addEdge_substitutingClassifier(substitution: GraphNode) {
  const clientId = substitution.getAttribute(Uml.Attributes.client)?.value
    .literal
  if (!clientId) {
    throw new Error('Missing client attribute on Substitution')
  }
  const client = substitution.model.getNodeById(clientId)
  if (!client) {
    throw new Error(`Missing client with id ${clientId} for Substitution`)
  }
  substitution.model.addEdge('substitutingClassifier', substitution, client)
}
