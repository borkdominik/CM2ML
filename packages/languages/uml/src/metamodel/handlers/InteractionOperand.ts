import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InteractionConstraint, InteractionOperand } from '../uml-metamodel'

export const InteractionOperandHandler = InteractionOperand.createHandler(
  (interactionOperand, { onlyContainmentAssociations }) => {
    const guards = resolve(interactionOperand, 'guard', { type: InteractionConstraint })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_fragment(interactionOperand)
    addEdge_guard(interactionOperand, guards)
  },
)

function addEdge_fragment(_interactionOperand: GraphNode) {
  // TODO/Association
  // ♦ fragment : InteractionFragment [0..*]{ordered, subsets Namespace::ownedMember} (opposite InteractionFragment::enclosingOperand)
  // The fragments of the operand.
}

function addEdge_guard(interactionOperand: GraphNode, guard: GraphNode | undefined) {
  // ♦ guard : InteractionConstraint [0..1]{subsets Element::ownedElement} (opposite A_guard_interactionOperand::interactionOperand)
  // Constraint of the operand.
  if (!guard) {
    return
  }
  interactionOperand.model.addEdge('guard', interactionOperand, guard)
}
