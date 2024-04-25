import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { CombinedFragment, Gate, InteractionOperand } from '../uml-metamodel'

export const CombinedFragmentHandler = CombinedFragment.createHandler(
  (combinedFragment, { onlyContainmentAssociations }) => {
    const cfragmentGates = resolve(combinedFragment, 'cfragmentGate', { many: true, type: Gate })
    const operands = resolve(combinedFragment, 'operand', { many: true, type: InteractionOperand })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_cfragmentGate(combinedFragment, cfragmentGates)
    addEdge_operand(combinedFragment, operands)
  },
  {
    [Uml.Attributes.interactionOperator]: { type: 'category', defaultValue: 'seq' },
  },
)

function addEdge_cfragmentGate(combinedFragment: GraphNode, cfragmentGates: GraphNode[]) {
  // ♦ cfragmentGate : Gate [0..*]{subsets Element::ownedElement} (opposite A_cfragmentGate_combinedFragment::combinedFragment)
  // Specifies the gates that form the interface between this CombinedFragment and its surroundings
  cfragmentGates.forEach((cfragmentGate) => {
    combinedFragment.model.addEdge('cfragmentGate', combinedFragment, cfragmentGate)
  })
}

function addEdge_operand(combinedFragment: GraphNode, operands: GraphNode[]) {
  // ♦ operand : InteractionOperand [1..*]{ordered, subsets Element::ownedElement} (opposite A_operand_combinedFragment::combinedFragment)
  // The set of operands of the combined fragment.
  operands.forEach((operand) => {
    combinedFragment.model.addEdge('operand', combinedFragment, operand)
  })
}
