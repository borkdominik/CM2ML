import type { GraphNode } from '@cm2ml/ir'

import { Expression } from '../uml-metamodel'

export const ExpressionHandler = Expression.createHandler(
  (expression, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_operand(expression)
  },
)

function addEdge_operand(_expression: GraphNode) {
  // TODO/Association
  // ♦ operand : ValueSpecification [0..*]{ordered, subsets Element::ownedElement} (opposite A_operand_expression::expression)
  // Specifies a sequence of operand ValueSpecifications.
}
