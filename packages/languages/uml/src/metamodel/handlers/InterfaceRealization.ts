import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { InterfaceRealization } from '../uml-metamodel'

export const InterfaceRealizationHandler = InterfaceRealization.createHandler(
  (interfaceRealization, { onlyContainmentAssociations }) => {
    // TODO/Jan: Add type config
    const contract = resolveFromAttribute(interfaceRealization, 'contract')
    const implementingClassifier = resolveFromAttribute(interfaceRealization, 'client', { removeAttribute: false })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(interfaceRealization, contract)
    addEdge_implementingClassifier(interfaceRealization, implementingClassifier)
  },
)

function addEdge_contract(interfaceRealization: GraphNode, contract: GraphNode | undefined) {
  if (!contract) {
    return
  }
  interfaceRealization.model.addEdge('contract', interfaceRealization, contract)
}

function addEdge_implementingClassifier(interfaceRealization: GraphNode, implementingClassifier: GraphNode | undefined) {
  if (!implementingClassifier) {
    return
  }
  interfaceRealization.model.addEdge(
    'implementingClassifier',
    interfaceRealization,
    implementingClassifier,
  )
}
