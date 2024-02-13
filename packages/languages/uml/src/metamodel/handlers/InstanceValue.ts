import type { GraphNode } from '@cm2ml/ir'

import { InstanceValue } from '../uml-metamodel'

export const InstanceValueHandler = InstanceValue.createHandler(
  (instanceValue, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_instance(instanceValue)
  },
)

function addEdge_instance(_instanceValue: GraphNode) {
  // TODO/Association
  // instance : InstanceSpecification [1..1] (opposite A_instance_instanceValue::instanceValue)
  // The InstanceSpecification that represents the specified value.
}
