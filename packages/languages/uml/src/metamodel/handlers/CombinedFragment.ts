import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { Uml } from '../uml'
import { CombinedFragment, InteractionOperand } from '../uml-metamodel'

export const CombinedFragmentHandler = CombinedFragment.createHandler(
  (combinedFragment, { onlyContainmentAssociations }) => {
    const operands = resolveFromChild(combinedFragment, 'operand', { many: true, type: InteractionOperand })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_cfragmentGate(combinedFragment)
    addEdge_operand(combinedFragment, operands)
  },
  {
    [Uml.Attributes.interactionOperator]: 'seq',
  },
)

function addEdge_cfragmentGate(_combinedFragment: GraphNode) {
  // TODO/Association
  // ♦ cfragmentGate : Gate [0..*]{subsets Element::ownedElement} (opposite A_cfragmentGate_combinedFragment::combinedFragment)
  // Specifies the gates that form the interface between this CombinedFragment and its surroundings
}

function addEdge_operand(combinedFragment: GraphNode, operands: GraphNode[]) {
  // ♦ operand : InteractionOperand [1..*]{ordered, subsets Element::ownedElement} (opposite A_operand_combinedFragment::combinedFragment)
  // The set of operands of the combined fragment.
  operands.forEach((operand) => {
    combinedFragment.model.addEdge('operand', combinedFragment, operand)
  })
}
