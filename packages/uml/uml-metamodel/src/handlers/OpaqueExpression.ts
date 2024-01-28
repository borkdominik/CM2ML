import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { OpaqueExpression } from '../uml-metamodel'

// TODO: Check that body attribute is parsed correctly
export const OpaqueExpressionHandler = OpaqueExpression.createHandler(
  (opaqueExpression, { onlyContainmentAssociations }) => {
    setAttribute_body(opaqueExpression)
    setAttribute_language(opaqueExpression)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_behavior(opaqueExpression)
    addEdge_result(opaqueExpression)
  },
)

function setAttribute_body(comment: GraphNode) {
  const body = comment.findChild((child) => child.tag === Uml.Tags.body)
  if (!body) {
    return
  }
  comment.model.removeNode(body)
  const bodyText = body.getAttribute(Uml.Attributes.body)
  if (!bodyText) {
    return
  }
  comment.addAttribute({ name: Uml.Attributes.body, value: bodyText.value })
}

function setAttribute_language(opaqueExpression: GraphNode) {
  const language = opaqueExpression.findChild(
    (child) => child.tag === Uml.Tags.language,
  )
  if (!language) {
    return
  }
  opaqueExpression.model.removeNode(language)
  const languageText = language.getAttribute(Uml.Attributes.language)
  if (!languageText) {
    return
  }
  opaqueExpression.addAttribute({
    name: Uml.Attributes.language,
    value: languageText.value,
  })
}

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
