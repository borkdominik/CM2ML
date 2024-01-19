import type { GraphNode } from '@cm2ml/ir'

import { DurationObservation } from '../uml-metamodel'

export const DurationObservationHandler = DurationObservation.createHandler(
  (durationObservation, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_event(durationObservation)
  },
)

function addEdge_event(_durationObservation: GraphNode) {
  // TODO/Association
  // event : NamedElement [1..2]{ordered} (opposite A_event_durationObservation::durationObservation)
  // The DurationObservation is determined as the duration between the entering or exiting of a single event Element during execution, or the entering/exiting of one event Element and the entering/exiting of a second.
}
