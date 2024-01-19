import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { TimeEvent } from '../uml-metamodel'

export const TimeEventHandler = TimeEvent.createHandler(
  (timeEvent, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_when(timeEvent)
  },
  {
    [Uml.Attributes.isRelative]: 'false',
  },
)

function addEdge_when(_timeEvent: GraphNode) {
  // TODO/Association
  // ♦ when : TimeExpression [1..1]{subsets Element::ownedElement} (opposite A_when_timeEvent::timeEvent)
  // Specifies the time of the TimeEvent.
}
