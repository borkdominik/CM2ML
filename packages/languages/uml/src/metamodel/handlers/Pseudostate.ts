import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Pseudostate } from '../uml-metamodel'

export const PseudostateHandler = Pseudostate.createHandler(
  (pseudostate, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_state(pseudostate)
    addEdge_stateMachine(pseudostate)
  },
  {
    [Uml.Attributes.kind]: { type: 'category', defaultValue: 'initial' },
  },
)

function addEdge_state(_pseudostate: GraphNode) {
  // TODO/Association
  // state : State [0..1]{subsets NamedElement::namespace} (opposite State::connectionPoint)
  // The State that owns this Pseudostate and in which it appears.
}

function addEdge_stateMachine(_pseudostate: GraphNode) {
  // TODO/Association
  // stateMachine : StateMachine [0..1]{subsets NamedElement::namespace} (opposite StateMachine::connectionPoint)
  // The StateMachine in which this Pseudostate is defined. This only applies to Pseudostates of the kind entryPoint or exitPoint.
}
