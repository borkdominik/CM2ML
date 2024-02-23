import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { OutputPin, ValueSpecificationAction } from '../uml-metamodel'

export const ValueSpecificationActionHandler =
  ValueSpecificationAction.createHandler(
    (valueSpecificationAction, { onlyContainmentAssociations }) => {
      const result = resolveFromChild(valueSpecificationAction, 'result', { type: OutputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(valueSpecificationAction, result)
      addEdge_value(valueSpecificationAction)
    },
  )

function addEdge_result(valueSpecificationAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_valueSpecificationAction::valueSpecificationAction)
  // The OutputPin on which the result value is placed.
  if (!result) {
    return
  }
  valueSpecificationAction.model.addEdge('result', valueSpecificationAction, result)
}

function addEdge_value(_valueSpecificationAction: GraphNode) {
  // TODO/Association
  // ♦ value : ValueSpecification [1..1]{subsets Element::ownedElement} (opposite A_value_valueSpecificationAction::valueSpecificationAction)
  // The ValueSpecification to be evaluated.
}
