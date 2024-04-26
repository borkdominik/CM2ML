import type { GraphNode } from '@cm2ml/ir'

import { setBodyAttribute } from '../resolvers/body'
import { setLanguageAttribute } from '../resolvers/language'
import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Behavior, OpaqueExpression } from '../uml-metamodel'

export const OpaqueExpressionHandler = OpaqueExpression.createHandler(
  (opaqueExpression, { onlyContainmentAssociations }) => {
    setBodyAttribute(opaqueExpression)
    setLanguageAttribute(opaqueExpression)
    const behavior = resolve(opaqueExpression, 'behavior', { type: Behavior })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_behavior(opaqueExpression, behavior)
    addEdge_result(opaqueExpression)
  },
  {
    [Uml.Attributes.body]: { type: 'string' },
    [Uml.Attributes.language]: { type: 'string' },
  },
)

function addEdge_behavior(opaqueExpression: GraphNode, behavior: GraphNode | undefined) {
  // behavior : Behavior [0..1] (opposite A_behavior_opaqueExpression::opaqueExpression)
  // Specifies the behavior of the OpaqueExpression as a UML Behavior.
  if (!behavior) {
    return
  }
  opaqueExpression.model.addEdge('behavior', opaqueExpression, behavior)
}

function addEdge_result(_opaqueExpression: GraphNode) {
  // TODO/Association
  // /result : Parameter [0..1]{} (opposite A_result_opaqueExpression::opaqueExpression)
  // If an OpaqueExpression is specified using a UML Behavior, then this refers to the single required return Parameter of that Behavior. When the Behavior completes execution, the values on this Parameter give the result of evaluating the OpaqueExpression.
}
