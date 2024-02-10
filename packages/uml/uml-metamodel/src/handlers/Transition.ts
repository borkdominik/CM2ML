import type { GraphNode } from '@cm2ml/ir'

import { resolvePath } from '../resolvers/path'
import { Uml } from '../uml'
import { Transition, Vertex, requireAssignability } from '../uml-metamodel'

export const TransitionHandler = Transition.createHandler(
  (transition, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_container(transition)
    addEdge_effect(transition)
    addEdge_guard(transition)
    addEdge_redefinedTransition(transition)
    addEdge_redefinitionContext(transition)
    addEdge_source(transition)
    addEdge_target(transition)
    addEdge_trigger(transition)
  },
  {
    [Uml.Attributes.kind]: 'external',
  },
)

function addEdge_container(_transition: GraphNode) {
  // TODO/Association
  // container : Region [1..1]{subsets NamedElement::namespace} (opposite Region::transition)
  // Designates the Region that owns this Transition.
}

function addEdge_effect(_transition: GraphNode) {
  // TODO/Association
  // ♦ effect : Behavior [0..1]{subsets Element::ownedElement} (opposite A_effect_transition::transition)
  // Specifies an optional behavior to be performed when the Transition fires.
}

function addEdge_guard(_transition: GraphNode) {
  // TODO/Association
  // ♦ guard : Constraint [0..1]{subsets Namespace::ownedRule} (opposite A_guard_transition::transition)
  // A guard is a Constraint that provides a fine-grained control over the firing of the Transition. The guard is evaluated when an Event occurrence is dispatched by the StateMachine. If the guard is true at that time, the Transition may be enabled, otherwise, it is disabled. Guards should be pure expressions without side effects. Guard expressions with side effects are ill formed.
}

function addEdge_redefinedTransition(_transition: GraphNode) {
  // TODO/Association
  // redefinedTransition : Transition [0..1]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedTransition_transition::transition)
  // The Transition that is redefined by this Transition.
}

function addEdge_redefinitionContext(_transition: GraphNode) {
  // TODO/Association
  // /redefinitionContext : Classifier [1..1]{redefines RedefinableElement::redefinitionContext} (opposite A_redefinitionContext_transition::transition)
  // References the Classifier in which context this element may be redefined.
}

function addEdge_source(transition: GraphNode) {
  // source : Vertex [1..1] (opposite Vertex::outgoing)
  // Designates the originating Vertex (State or Pseudostate) of the Transition.
  const sourceAttribute = transition.getAttribute('source')?.value.literal
  if (!sourceAttribute) {
    return
  }
  const sourceNode = resolvePath(transition.model, sourceAttribute)
  if (!sourceNode) {
    throw new Error(`Missing source for transition ${transition.id}`)
  }
  requireAssignability(sourceNode, Vertex)
  transition.removeAttribute('source')
  transition.model.addEdge('source', transition, sourceNode)
}

function addEdge_target(transition: GraphNode) {
  // target : Vertex [1..1] (opposite Vertex::incoming)
  // Designates the target Vertex that is reached when the Transition is taken.
  const targetAttribute = transition.getAttribute('target')?.value.literal
  if (!targetAttribute) {
    return
  }
  const targetNode = resolvePath(transition.model, targetAttribute)
  if (!targetNode) {
    throw new Error(`Missing target for transition ${transition.id}`)
  }
  requireAssignability(targetNode, Vertex)
  transition.removeAttribute('target')
  transition.model.addEdge('target', transition, targetNode)
}

function addEdge_trigger(_transition: GraphNode) {
  // TODO/Association
  // ♦ trigger : Trigger [0..*]{subsets Element::ownedElement} (opposite A_trigger_transition::transition)
  // Specifies the Triggers that may fire the transition.
}
