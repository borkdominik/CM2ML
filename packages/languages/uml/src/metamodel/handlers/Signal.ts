import type { GraphNode } from '@cm2ml/ir'

import { Signal } from '../uml-metamodel'

export const SignalHandler = Signal.createHandler(
  (signal, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedAttribute(signal)
  },
)

function addEdge_ownedAttribute(_signal: GraphNode) {
  // TODO/Association
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets Namespace::ownedMember} (opposite A_ownedAttribute_owningSignal::owningSignal)
  // The attributes owned by the Signal.
}
