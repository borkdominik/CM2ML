import type { GraphNode } from '@cm2ml/ir'

import { InteractionOperand } from '../uml-metamodel'

export const InteractionOperandHandler = InteractionOperand.createHandler(
  (interactionOperand, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_fragment(interactionOperand)
    addEdge_guard(interactionOperand)
  },
)

function addEdge_fragment(_interactionOperand: GraphNode) {
  // TODO/Association
  // ♦ fragment : InteractionFragment [0..*]{ordered, subsets Namespace::ownedMember} (opposite InteractionFragment::enclosingOperand)
  // The fragments of the operand.
}

function addEdge_guard(_interactionOperand: GraphNode) {
  // TODO/Association
  // ♦ guard : InteractionConstraint [0..1]{subsets Element::ownedElement} (opposite A_guard_interactionOperand::interactionOperand)
  // Constraint of the operand.
}
