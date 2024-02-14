import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { InstanceValue } from '../uml-metamodel'

export const InstanceValueHandler = InstanceValue.createHandler(
  (instanceValue, { onlyContainmentAssociations }) => {
    const instance = resolveFromAttribute(instanceValue, 'instance')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_instance(instanceValue, instance)
  },
)

function addEdge_instance(instanceValue: GraphNode, instance: GraphNode | undefined) {
  // TODO/Association
  // instance : InstanceSpecification [1..1] (opposite A_instance_instanceValue::instanceValue)
  // The InstanceSpecification that represents the specified value.
  if (!instance) {
    return
  }
  instanceValue.model.addEdge('instance', instanceValue, instance)
}
