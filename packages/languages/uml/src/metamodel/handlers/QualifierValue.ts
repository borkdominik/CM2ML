import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Property, QualifierValue } from '../uml-metamodel'

export const QualifierValueHandler = QualifierValue.createHandler(
  (qualifierValue, { onlyContainmentAssociations }) => {
    const qualifier = resolve(qualifierValue, 'qualifier', { type: Property })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_qualifer(qualifierValue, qualifier)
    addEdge_value(qualifierValue)
  },
)
function addEdge_qualifer(qualifierValue: GraphNode, qualifier: GraphNode | undefined) {
  // qualifier : Property [1..1] (opposite A_qualifier_qualifierValue::qualifierValue)
  // The qualifier Property for which the value is to be specified.
  if (!qualifier) {
    return
  }
  qualifierValue.model.addEdge('qualifier', qualifierValue, qualifier)
}

function addEdge_value(_qualifierValue: GraphNode) {
  // TODO/Association
  // value : InputPin [1..1] (opposite A_value_qualifierValue::qualifierValue)
  // The InputPin from which the specified value for the qualifier is taken.
}
