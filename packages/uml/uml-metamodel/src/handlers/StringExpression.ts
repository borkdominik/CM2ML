import type { GraphNode } from '@cm2ml/ir'

import { StringExpression } from '../uml-metamodel'

export const StringExpressionHandler = StringExpression.createHandler(
  (stringExpression, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_owningExpression(stringExpression)
    addEdge_subExpression(stringExpression)
  },
)

function addEdge_owningExpression(_stringExpression: GraphNode) {
  // TODO/Association
  // owningExpression : StringExpression [0..1]{subsets Element::owner} (opposite StringExpression::subExpression)
  // The StringExpression of which this StringExpression is a subExpression.
}

function addEdge_subExpression(_stringExpression: GraphNode) {
  // TODO/Association
  // ♦ subExpression : StringExpression [0..*]{ordered, subsets Element::ownedElement} (opposite StringExpression::owningExpression)
  // The StringExpressions that constitute this StringExpression.
}
