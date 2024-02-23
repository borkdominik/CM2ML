import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Constraint, StateInvariant } from '../uml-metamodel'

export const StateInvariantHandler = StateInvariant.createHandler(
  (stateInvariant, { onlyContainmentAssociations }) => {
    const invariant = resolve(stateInvariant, 'invariant', { type: Constraint })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_covered(stateInvariant)
    addEdge_invariant(stateInvariant, invariant)
  },
)
function addEdge_covered(_stateInvariant: GraphNode) {
  // TODO/Association
  // covered : Lifeline [1..1]{redefines InteractionFragment::covered} (opposite A_covered_stateInvariant::stateInvariant)
  // References the Lifeline on which the StateInvariant appears.
}

function addEdge_invariant(_stateInvariant: GraphNode, invariant: GraphNode | undefined) {
  // ♦ invariant : Constraint [1..1]{subsets Element::ownedElement} (opposite A_invariant_stateInvariant::stateInvariant)
  // A Constraint that should hold at runtime for this StateInvariant.
  if (!invariant) {
    return
  }
  invariant.model.addEdge('invariant', invariant, invariant)
}
