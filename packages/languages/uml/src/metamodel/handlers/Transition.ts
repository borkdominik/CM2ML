import type { GraphNode } from '@cm2ml/ir'
import { transformNodeToEdge } from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Transition, Trigger, Vertex } from '../uml-metamodel'

export const TransitionHandler = Transition.createHandler(
  (transition, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const source = resolveFromAttribute(transition, 'source', { type: Vertex })
    const target = resolveFromAttribute(transition, 'target', { type: Vertex })
    if (relationshipsAsEdges) {
      transformNodeToEdge(transition, source, target, 'transition')
      return
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_container(transition)
    addEdge_effect(transition)
    addEdge_guard(transition)
    addEdge_redefinedTransition(transition)
    addEdge_redefinitionContext(transition)
    addEdge_source(transition, source)
    addEdge_target(transition, target)
    transition.children.forEach((child) => {
      addEdge_trigger(transition, child)
    })
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

function addEdge_source(transition: GraphNode, source: GraphNode | undefined) {
  // source : Vertex [1..1] (opposite Vertex::outgoing)
  // Designates the originating Vertex (State or Pseudostate) of the Transition.
  if (!source) {
    return
  }
  transition.model.addEdge('source', transition, source)
}

function addEdge_target(transition: GraphNode, target: GraphNode | undefined) {
  // target : Vertex [1..1] (opposite Vertex::incoming)
  // Designates the target Vertex that is reached when the Transition is taken.
  if (!target) {
    return
  }
  transition.model.addEdge('target', transition, target)
}

function addEdge_trigger(transition: GraphNode, child: GraphNode) {
  // TODO/Association
  // ♦ trigger : Trigger [0..*]{subsets Element::ownedElement} (opposite A_trigger_transition::transition)
  // Specifies the Triggers that may fire the transition.
  if (Trigger.isAssignable(child)) {
    transition.model.addEdge('trigger', transition, child)
  }
}
