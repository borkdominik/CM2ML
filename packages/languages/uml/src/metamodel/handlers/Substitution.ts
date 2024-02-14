import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Substitution } from '../uml-metamodel'

// TODO/Jan: Validate associations
export const SubstitutionHandler = Substitution.createHandler(
  (substitution, { onlyContainmentAssociations }) => {
    // TODO/Jan: Add type configs
    const contract = resolveFromAttribute(substitution, 'contract')
    const substitutingClassifier = resolveFromAttribute(substitution, 'client', { removeAttribute: false })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(substitution, contract)
    addEdge_substitutingClassifier(substitution, substitutingClassifier)
  },
)

function addEdge_contract(substitution: GraphNode, contract: GraphNode | undefined) {
  if (!contract) {
    return
  }
  substitution.model.addEdge('contract', substitution, contract)
}

function addEdge_substitutingClassifier(substitution: GraphNode, substitutingClassifier: GraphNode | undefined) {
  if (!substitutingClassifier) {
    return
  }
  substitution.model.addEdge('substitutingClassifier', substitution, substitutingClassifier)
}
