import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Region, State, StateMachine, Transition } from '../uml-metamodel'

export const RegionHandler = Region.createHandler(
  (region, { onlyContainmentAssociations }) => {
    const extendedRegion = resolve(region, 'extendedRegion', { type: Region })
    const state = resolve(region, 'state', { type: State })
    const stateMachine = resolve(region, 'stateMachine', { type: StateMachine })
    const transitions = resolve(region, 'transition', { many: true, type: Transition })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_extendedRegion(region, extendedRegion)
    addEdge_redefinitionContext(region)
    addEdge_state(region, state)
    addEdge_stateMachine(region, stateMachine)
    addEdge_subvertex(region)
    addEdge_transition(region, transitions)
  },
)

function addEdge_extendedRegion(region: GraphNode, extendedRegion: GraphNode | undefined) {
  // extendedRegion : Region [0..1]{subsets RedefinableElement::redefinedElement} (opposite A_extendedRegion_region::region)
  // The region of which this region is an extension.
  if (!extendedRegion) {
    return
  }
  region.model.addEdge('extendedRegion', region, extendedRegion)
}

function addEdge_redefinitionContext(_region: GraphNode) {
  // TODO/Association
  // /redefinitionContext : Classifier [1..1]{redefines RedefinableElement::redefinitionContext} (opposite A_redefinitionContext_region::region)
  // References the Classifier in which context this element may be redefined.
}

function addEdge_state(region: GraphNode, state: GraphNode | undefined) {
  // state : State [0..1]{subsets NamedElement::namespace} (opposite State::region)
  // The State that owns the Region. If a Region is owned by a State, then it cannot also be owned by a StateMachine.
  if (!state) {
    return
  }
  region.model.addEdge('state', region, state)
}

function addEdge_stateMachine(region: GraphNode, stateMachine: GraphNode | undefined) {
  // stateMachine : StateMachine [0..1]{subsets NamedElement::namespace} (opposite StateMachine::region)
  // The StateMachine that owns the Region. If a Region is owned by a StateMachine, then it cannot also be owned by a State.
  if (!stateMachine) {
    return
  }
  region.model.addEdge('stateMachine', region, stateMachine)
}

function addEdge_subvertex(_region: GraphNode) {
  // TODO/Association
  // ♦ subvertex : Vertex [0..*]{subsets Namespace::ownedMember} (opposite Vertex::container)
  // The set of Vertices that are owned by this Region.
}

function addEdge_transition(region: GraphNode, transitions: GraphNode[]) {
  // ♦ transition : Transition [0..*]{subsets Namespace::ownedMember} (opposite Transition::container)
  // The set of Transitions owned by the Region.
  transitions.forEach((transition) => {
    region.model.addEdge('transition', region, transition)
  })
}
