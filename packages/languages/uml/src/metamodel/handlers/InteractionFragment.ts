import type { GraphNode } from '@cm2ml/ir'

import { resolve, resolveFromAttribute } from '../resolvers/resolve'
import { GeneralOrdering, InteractionFragment } from '../uml-metamodel'

export const InteractionFragmentHandler = InteractionFragment.createHandler(
  (interactionFragment, { onlyContainmentAssociations }) => {
    const covered = resolveFromAttribute(interactionFragment, 'covered', { many: true })
    const generalOrderings = resolve(interactionFragment, 'generalOrdering', { many: true, type: GeneralOrdering })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_covered(interactionFragment, covered)
    addEdge_enclosingInteraction(interactionFragment)
    addEdge_enclosingOperand(interactionFragment)
    addEdge_generalOrdering(interactionFragment, generalOrderings)
  },
)

function addEdge_covered(interactionFragment: GraphNode, covered: GraphNode[]) {
  // TODO/Association
  // covered : Lifeline [0..*] (opposite Lifeline::coveredBy)
  // References the Lifelines that the InteractionFragment involves.
  covered.forEach((covered) => {
    interactionFragment.model.addEdge('covered', interactionFragment, covered)
  })
}

function addEdge_enclosingInteraction(_interactionFragment: GraphNode) {
  // TODO/Association
  // enclosingInteraction : Interaction [0..1]{subsets NamedElement::namespace} (opposite Interaction::fragment)
  // The Interaction enclosing this InteractionFragment.
}

function addEdge_enclosingOperand(_interactionFragment: GraphNode) {
  // TODO/Association
  // enclosingOperand : InteractionOperand [0..1]{subsets NamedElement::namespace} (opposite InteractionOperand::fragment)
  // The operand enclosing this InteractionFragment (they may nest recursively).
}

function addEdge_generalOrdering(interactionFragment: GraphNode, generalOrderings: GraphNode[]) {
  // ♦ generalOrdering : GeneralOrdering [0..*]{subsets Element::ownedElement} (opposite A_generalOrdering_interactionFragment::interactionFragment)
  // The general ordering relationships contained in this fragment.
  generalOrderings.forEach((generalOrdering) => {
    interactionFragment.model.addEdge('generalOrdering', interactionFragment, generalOrdering)
  })
}
