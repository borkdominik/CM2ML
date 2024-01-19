import type { GraphNode } from '@cm2ml/ir'

import { OpaqueExpression } from '../uml-metamodel'

// TODO: Check that body attribute is parsed correctly
export const OpaqueExpressionHandler = OpaqueExpression.createHandler(
  (opaqueExpression, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_behavior(opaqueExpression)
    addEdge_result(opaqueExpression)
  },
)

function addEdge_behavior(_opaqueExpression: GraphNode) {
  // TODO/Association
  // behavior : Behavior [0..1] (opposite A_behavior_opaqueExpression::opaqueExpression)
  // Specifies the behavior of the OpaqueExpression as a UML Behavior.
}

function addEdge_result(_opaqueExpression: GraphNode) {
  // TODO/Association
  // /result : Parameter [0..1]{} (opposite A_result_opaqueExpression::opaqueExpression)
  // If an OpaqueExpression is specified using a UML Behavior, then this refers to the single required return Parameter of that Behavior. When the Behavior completes execution, the values on this Parameter give the result of evaluating the OpaqueExpression.
}
