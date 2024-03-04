import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Property, Signal } from '../uml-metamodel'

export const SignalHandler = Signal.createHandler(
  (signal, { onlyContainmentAssociations }) => {
    const ownedAttributes = resolve(signal, 'ownedAttribute', { many: true, type: Property })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedAttribute(signal, ownedAttributes)
  },
)

function addEdge_ownedAttribute(signal: GraphNode, ownedAttributes: GraphNode[]) {
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets Namespace::ownedMember} (opposite A_ownedAttribute_owningSignal::owningSignal)
  // The attributes owned by the Signal.
  ownedAttributes.forEach((ownedAttribute) => {
    signal.model.addEdge('ownedAttribute', signal, ownedAttribute)
  })
}
