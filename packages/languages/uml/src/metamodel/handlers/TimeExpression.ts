import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { TimeExpression, ValueSpecification } from '../uml-metamodel'

export const TimeExpressionHandler = TimeExpression.createHandler(
  (timeExpression, { onlyContainmentAssociations }) => {
    const expr = resolve(timeExpression, 'expr', { type: ValueSpecification })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_expr(timeExpression, expr)
    addEdge_observation(timeExpression)
  },
)

function addEdge_expr(timeExpression: GraphNode, expr: GraphNode | undefined) {
  // ♦ expr : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_expr_timeExpression::timeExpression)
  // A ValueSpecification that evaluates to the value of the TimeExpression.
  if (!expr) {
    return
  }
  timeExpression.model.addEdge('expr', timeExpression, expr)
}

function addEdge_observation(_timeExpression: GraphNode) {
  // TODO/Association
  // observation : Observation [0..*] (opposite A_observation_timeExpression::timeExpression)
  // Refers to the Observations that are involved in the computation of the TimeExpression value.
}
