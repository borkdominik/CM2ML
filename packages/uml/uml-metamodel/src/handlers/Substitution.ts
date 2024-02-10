import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/fromAttribute'
import { Substitution } from '../uml-metamodel'

// TODO/Jan: Validate associations
export const SubstitutionHandler = Substitution.createHandler(
  (substitution, { onlyContainmentAssociations }) => {
    // TODO/Jan: Add type configs
    const contract = resolveFromAttribute(substitution, 'contract', { required: true })
    const substitutingClassifier = resolveFromAttribute(substitution, 'client', { removeAttribute: false, required: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(substitution, contract)
    addEdge_substitutingClassifier(substitution, substitutingClassifier)
  },
)

function addEdge_contract(substitution: GraphNode, contract: GraphNode) {
  substitution.model.addEdge('contract', substitution, contract)
}

function addEdge_substitutingClassifier(substitution: GraphNode, substitutingClassifier: GraphNode) {
  substitution.model.addEdge('substitutingClassifier', substitution, substitutingClassifier)
}
