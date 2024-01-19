import type { GraphNode } from '@cm2ml/ir'

import { OccurrenceSpecification } from '../uml-metamodel'

export const OccurrenceSpecificationHandler =
  OccurrenceSpecification.createHandler(
    (occurrenceSpecification, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_covered(occurrenceSpecification)
      addEdge_toAfter(occurrenceSpecification)
      addEdge_toBefore(occurrenceSpecification)
    },
  )

function addEdge_covered(_occurrenceSpecification: GraphNode) {
  // TODO/Association
  // covered : Lifeline [1..1]{redefines InteractionFragment::covered} (opposite A_covered_events::events)
  // References the Lifeline on which the OccurrenceSpecification appears.
}

function addEdge_toAfter(_occurrenceSpecification: GraphNode) {
  // TODO/Association
  // toAfter : GeneralOrdering [0..*] (opposite GeneralOrdering::before)
  // References the GeneralOrderings that specify EventOcurrences that must occur after this OccurrenceSpecification.
}

function addEdge_toBefore(_occurrenceSpecification: GraphNode) {
  // TODO/Association
  // toBefore : GeneralOrdering [0..*] (opposite GeneralOrdering::after)
  // References the GeneralOrderings that specify EventOcurrences that must occur before this OccurrenceSpecification.
}
