import type { GraphNode } from '@cm2ml/ir'

import { QualifierValue } from '../uml-metamodel'

export const QualifierValueHandler = QualifierValue.createHandler(
  (qualifierValue, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_qualifer(qualifierValue)
    addEdge_value(qualifierValue)
  },
)
function addEdge_qualifer(_qualifierValue: GraphNode) {
  // TODO/Association
  // qualifier : Property [1..1] (opposite A_qualifier_qualifierValue::qualifierValue)
  // The qualifier Property for which the value is to be specified.
}

function addEdge_value(_qualifierValue: GraphNode) {
  // TODO/Association
  // value : InputPin [1..1] (opposite A_value_qualifierValue::qualifierValue)
  // The InputPin from which the specified value for the qualifier is taken.
}
