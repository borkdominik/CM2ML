import type { GraphNode } from '@cm2ml/ir'

import { BehaviorExecutionSpecification } from '../uml-metamodel'

export const BehaviorExecutionSpecificationHandler =
  BehaviorExecutionSpecification.createHandler(
    (behaviorExecutionSpecification, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_behavior(behaviorExecutionSpecification)
    },
  )

function addEdge_behavior(_behaviorExecutionSpecification: GraphNode) {
  // TODO/Association
  // behavior : Behavior [0..1] (opposite A_behavior_behaviorExecutionSpecification::behaviorExecutionSpecification)
  // Behavior whose execution is occurring.
}
