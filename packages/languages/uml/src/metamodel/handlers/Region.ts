import type { GraphNode } from '@cm2ml/ir'

import { Region } from '../uml-metamodel'

export const RegionHandler = Region.createHandler(
  (region, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_extendedRegion(region)
    addEdge_redefinitionContext(region)
    addEdge_state(region)
    addEdge_stateMachine(region)
    addEdge_subvertex(region)
    addEdge_transition(region)
  },
)

function addEdge_extendedRegion(_region: GraphNode) {
  // TODO/Association
  // extendedRegion : Region [0..1]{subsets RedefinableElement::redefinedElement} (opposite A_extendedRegion_region::region)
  // The region of which this region is an extension.
}

function addEdge_redefinitionContext(_region: GraphNode) {
  // TODO/Association
  // /redefinitionContext : Classifier [1..1]{redefines RedefinableElement::redefinitionContext} (opposite A_redefinitionContext_region::region)
  // References the Classifier in which context this element may be redefined.
}

function addEdge_state(_region: GraphNode) {
  // TODO/Association
  // state : State [0..1]{subsets NamedElement::namespace} (opposite State::region)
  // The State that owns the Region. If a Region is owned by a State, then it cannot also be owned by a StateMachine.
}

function addEdge_stateMachine(_region: GraphNode) {
  // TODO/Association
  // stateMachine : StateMachine [0..1]{subsets NamedElement::namespace} (opposite StateMachine::region)
  // The StateMachine that owns the Region. If a Region is owned by a StateMachine, then it cannot also be owned by a State.
}

function addEdge_subvertex(_region: GraphNode) {
  // TODO/Association
  // ♦ subvertex : Vertex [0..*]{subsets Namespace::ownedMember} (opposite Vertex::container)
  // The set of Vertices that are owned by this Region.
}

function addEdge_transition(_region: GraphNode) {
  // TODO/Association
  // ♦ transition : Transition [0..*]{subsets Namespace::ownedMember} (opposite Transition::container)
  // The set of Transitions owned by the Region.
}
