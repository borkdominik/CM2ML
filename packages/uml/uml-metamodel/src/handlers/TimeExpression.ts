import type { GraphNode } from '@cm2ml/ir'

import { TimeExpression } from '../uml-metamodel'

export const TimeExpressionHandler = TimeExpression.createHandler(
  (timeExpression, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_expr(timeExpression)
    addEdge_observation(timeExpression)
  },
)

function addEdge_expr(_timeExpression: GraphNode) {
  // TODO/Association
  // ♦ expr : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_expr_timeExpression::timeExpression)
  // A ValueSpecification that evaluates to the value of the TimeExpression.
}

function addEdge_observation(_timeExpression: GraphNode) {
  // TODO/Association
  // observation : Observation [0..*] (opposite A_observation_timeExpression::timeExpression)
  // Refers to the Observations that are involved in the computation of the TimeExpression value.
}
