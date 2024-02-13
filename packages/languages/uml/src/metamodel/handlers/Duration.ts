import type { GraphNode } from '@cm2ml/ir'

import { Duration } from '../uml-metamodel'

export const DurationHandler = Duration.createHandler(
  (duration, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_expr(duration)
    addEdge_observation(duration)
  },
)

function addEdge_expr(_duration: GraphNode) {
  // TODO/Association
  // ♦ expr : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_expr_duration::duration)
  // A ValueSpecification that evaluates to the value of the Duration.
}

function addEdge_observation(_duration: GraphNode) {
  // TODO/Association
  // observation : Observation [0..*] (opposite A_observation_duration::duration)
  // Refers to the Observations that are involved in the computation of the Duration value.
}
