import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { CombinedFragment, InteractionOperand } from '../uml-metamodel'

export const CombinedFragmentHandler = CombinedFragment.createHandler(
  (combinedFragment, { onlyContainmentAssociations }) => {
    inferChildTypes(combinedFragment)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_cfragmentGate(combinedFragment)
    combinedFragment.children.forEach((child) => {
      addEdge_operand(combinedFragment, child)
    })
  },
  {
    [Uml.Attributes.interactionOperator]: 'seq',
  },
)

function inferChildTypes(combinedFragment: GraphNode) {
  // TODO/Jan: Only as fallback
  combinedFragment.children.forEach((child) => {
    if (child.tag === Uml.Tags.operand) {
      child.addAttribute({ name: Uml.typeAttributeName, value: { literal: Uml.Types.InteractionOperand } })
    }
  })
}

function addEdge_cfragmentGate(_combinedFragment: GraphNode) {
  // TODO/Association
  // ♦ cfragmentGate : Gate [0..*]{subsets Element::ownedElement} (opposite A_cfragmentGate_combinedFragment::combinedFragment)
  // Specifies the gates that form the interface between this CombinedFragment and its surroundings
}

function addEdge_operand(combinedFragment: GraphNode, child: GraphNode) {
  // TODO/Association
  // ♦ operand : InteractionOperand [1..*]{ordered, subsets Element::ownedElement} (opposite A_operand_combinedFragment::combinedFragment)
  // The set of operands of the combined fragment.
  if (InteractionOperand.isAssignable(child)) {
    combinedFragment.model.addEdge('operand', combinedFragment, child)
  }
}
