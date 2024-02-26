import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { BehavioredClassifier, Interface, InterfaceRealization } from '../uml-metamodel'

export const InterfaceRealizationHandler = InterfaceRealization.createHandler(
  (interfaceRealization, { onlyContainmentAssociations }) => {
    const contract = resolve(interfaceRealization, 'contract', { type: Interface })
    const implementingClassifier = resolve(interfaceRealization, 'client', { removeAttribute: false, type: BehavioredClassifier })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(interfaceRealization, contract)
    addEdge_implementingClassifier(interfaceRealization, implementingClassifier)
  },
)

function addEdge_contract(interfaceRealization: GraphNode, contract: GraphNode | undefined) {
  // contract : Interface [1..1]{subsets Dependency::supplier} (opposite A_contract_interfaceRealization::interfaceRealization)
  // References the Interface specifying the conformance contract.
  if (!contract) {
    return
  }
  interfaceRealization.model.addEdge('contract', interfaceRealization, contract)
}

function addEdge_implementingClassifier(interfaceRealization: GraphNode, implementingClassifier: GraphNode | undefined) {
  // implementingClassifier : BehavioredClassifier [1..1]{subsets Dependency::client, subsets Element::owner} (opposite BehavioredClassifier::interfaceRealization)
  // References the BehavioredClassifier that owns this InterfaceRealization, i.e., the BehavioredClassifier that realizes the Interface to which it refers.
  if (!implementingClassifier) {
    return
  }
  interfaceRealization.model.addEdge(
    'implementingClassifier',
    interfaceRealization,
    implementingClassifier,
  )
}
