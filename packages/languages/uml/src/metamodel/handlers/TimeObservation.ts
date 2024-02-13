import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { TimeObservation } from '../uml-metamodel'

export const TimeObservationHandler = TimeObservation.createHandler(
  (timeObservation, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_event(timeObservation)
  },
  {
    [Uml.Attributes.firstEvent]: 'true',
  },
)

function addEdge_event(_timeObservation: GraphNode) {
  // TODO/Association
  // event : NamedElement [1..1] (opposite A_event_timeObservation::timeObservation)
  // The TimeObservation is determined by the entering or exiting of the event Element during execution.
}
