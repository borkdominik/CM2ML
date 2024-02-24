import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InstanceSpecification, InstanceValue } from '../uml-metamodel'

export const InstanceValueHandler = InstanceValue.createHandler(
  (instanceValue, { onlyContainmentAssociations }) => {
    const instance = resolve(instanceValue, 'instance', { type: InstanceSpecification })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_instance(instanceValue, instance)
  },
)

function addEdge_instance(instanceValue: GraphNode, instance: GraphNode | undefined) {
  // instance : InstanceSpecification [1..1] (opposite A_instance_instanceValue::instanceValue)
  // The InstanceSpecification that represents the specified value.
  if (!instance) {
    return
  }
  instanceValue.model.addEdge('instance', instanceValue, instance)
}
