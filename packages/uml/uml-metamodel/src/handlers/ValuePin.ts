import type { GraphNode } from '@cm2ml/ir'

import { ValuePin } from '../uml-metamodel'

export const ValuePinHandler = ValuePin.createHandler(
  (valuePin, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_value(valuePin)
  },
)

function addEdge_value(_valuePin: GraphNode) {
  // TODO/Association
  // ♦ value : ValueSpecification [1..1]{subsets Element::ownedElement} (opposite A_value_valuePin::valuePin)
  // The ValueSpecification that is evaluated to obtain the value that the ValuePin will provide.
}
