import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { BehaviorExecutionSpecification } from '../uml-metamodel'

export const BehaviorExecutionSpecificationHandler =
  BehaviorExecutionSpecification.createHandler(
    (behaviorExecutionSpecification, { onlyContainmentAssociations }) => {
      const behavior = resolveFromAttribute(behaviorExecutionSpecification, 'behavior')
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_behavior(behaviorExecutionSpecification, behavior)
    },
  )

function addEdge_behavior(behaviorExecutionSpecification: GraphNode, behavior: GraphNode | undefined) {
  // behavior : Behavior [0..1] (opposite A_behavior_behaviorExecutionSpecification::behaviorExecutionSpecification)
  // Behavior whose execution is occurring.
  if (!behavior) {
    return
  }
  behaviorExecutionSpecification.model.addEdge('behavior', behaviorExecutionSpecification, behavior)
}
