import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Pseudostate, State } from '../uml-metamodel'

export const PseudostateHandler = Pseudostate.createHandler(
  (pseudostate, { onlyContainmentAssociations }) => {
    const state = resolve(pseudostate, 'state', { type: State })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_state(pseudostate, state)
    addEdge_stateMachine(pseudostate)
  },
  {
    [Uml.Attributes.kind]: { type: 'category', defaultValue: 'initial' },
  },
)

function addEdge_state(pseudostate: GraphNode, state: GraphNode | undefined) {
  // state : State [0..1]{subsets NamedElement::namespace} (opposite State::connectionPoint)
  // The State that owns this Pseudostate and in which it appears.
  if (!state) {
    return
  }
  pseudostate.model.addEdge('state', pseudostate, state)
}

function addEdge_stateMachine(_pseudostate: GraphNode) {
  // TODO/Association
  // stateMachine : StateMachine [0..1]{subsets NamedElement::namespace} (opposite StateMachine::connectionPoint)
  // The StateMachine in which this Pseudostate is defined. This only applies to Pseudostates of the kind entryPoint or exitPoint.
}
