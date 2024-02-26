import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Classifier, Substitution } from '../uml-metamodel'

// TODO/Jan: Validate associations
export const SubstitutionHandler = Substitution.createHandler(
  (substitution, { onlyContainmentAssociations }) => {
    // TODO/Jan: Add type configs
    const contract = resolve(substitution, 'contract', { type: Classifier })
    const substitutingClassifier = resolve(substitution, 'client', { removeAttribute: false, type: Classifier })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(substitution, contract)
    addEdge_substitutingClassifier(substitution, substitutingClassifier)
  },
)

function addEdge_contract(substitution: GraphNode, contract: GraphNode | undefined) {
  // contract : Classifier [1..1]{subsets Dependency::supplier} (opposite A_contract_substitution::substitution)
  if (!contract) {
    return
  }
  substitution.model.addEdge('contract', substitution, contract)
}

function addEdge_substitutingClassifier(substitution: GraphNode, substitutingClassifier: GraphNode | undefined) {
  // substitutingClassifier : Classifier [1..1]{subsets Dependency::client, subsets Element::owner} (opposite Classifier::substitution)
  if (!substitutingClassifier) {
    return
  }
  substitution.model.addEdge('substitutingClassifier', substitution, substitutingClassifier)
}
