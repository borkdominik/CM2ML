import type { GraphNode } from '@cm2ml/ir'

import { ValueSpecificationAction } from '../uml-metamodel'

export const ValueSpecificationActionHandler =
  ValueSpecificationAction.createHandler(
    (valueSpecificationAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(valueSpecificationAction)
      addEdge_value(valueSpecificationAction)
    },
  )

function addEdge_result(_valueSpecificationAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_valueSpecificationAction::valueSpecificationAction)
  // The OutputPin on which the result value is placed.
}

function addEdge_value(_valueSpecificationAction: GraphNode) {
  // TODO/Association
  // ♦ value : ValueSpecification [1..1]{subsets Element::ownedElement} (opposite A_value_valueSpecificationAction::valueSpecificationAction)
  // The ValueSpecification to be evaluated.
}
