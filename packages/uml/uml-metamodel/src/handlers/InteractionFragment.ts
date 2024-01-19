import type { GraphNode } from '@cm2ml/ir'

import { InteractionFragment } from '../uml-metamodel'

export const InteractionFragmentHandler = InteractionFragment.createHandler(
  (interactionFragment, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_covered(interactionFragment)
    addEdge_enclosingInteraction(interactionFragment)
    addEdge_enclosingOperand(interactionFragment)
    addEdge_generalOrdering(interactionFragment)
  },
)

function addEdge_covered(_interactionFragment: GraphNode) {
  // TODO
  // covered : Lifeline [0..*] (opposite Lifeline::coveredBy)
  // References the Lifelines that the InteractionFragment involves.
}

function addEdge_enclosingInteraction(_interactionFragment: GraphNode) {
  // TODO
  // enclosingInteraction : Interaction [0..1]{subsets NamedElement::namespace} (opposite Interaction::fragment)
  // The Interaction enclosing this InteractionFragment.
}

function addEdge_enclosingOperand(_interactionFragment: GraphNode) {
  // TODO
  // enclosingOperand : InteractionOperand [0..1]{subsets NamedElement::namespace} (opposite InteractionOperand::fragment)
  // The operand enclosing this InteractionFragment (they may nest recursively).
}

function addEdge_generalOrdering(_interactionFragment: GraphNode) {
  // TODO
  // ♦ generalOrdering : GeneralOrdering [0..*]{subsets Element::ownedElement} (opposite A_generalOrdering_interactionFragment::interactionFragment)
  // The general ordering relationships contained in this fragment.
}
