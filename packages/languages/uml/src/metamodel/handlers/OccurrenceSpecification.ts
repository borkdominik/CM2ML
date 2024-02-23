import type { GraphNode } from '@cm2ml/ir'

import { resolve, resolveFromAttribute } from '../resolvers/resolve'
import { GeneralOrdering, OccurrenceSpecification } from '../uml-metamodel'

export const OccurrenceSpecificationHandler =
  OccurrenceSpecification.createHandler(
    (occurrenceSpecification, { onlyContainmentAssociations }) => {
      const toAfters = resolve(occurrenceSpecification, 'toAfter', { many: true, type: GeneralOrdering })
      const toBefores = resolve(occurrenceSpecification, 'toBefore', { many: true, type: GeneralOrdering })
      // TODO/Jan: Validate that the event is truly unspecified
      // Remove unspecified attribute
      resolveFromAttribute(occurrenceSpecification, 'event')
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_covered(occurrenceSpecification)
      addEdge_toAfter(occurrenceSpecification, toAfters)
      addEdge_toBefore(occurrenceSpecification, toBefores)
    },
  )

function addEdge_covered(_occurrenceSpecification: GraphNode) {
  // TODO/Association
  // covered : Lifeline [1..1]{redefines InteractionFragment::covered} (opposite A_covered_events::events)
  // References the Lifeline on which the OccurrenceSpecification appears.
}

function addEdge_toAfter(occurrenceSpecification: GraphNode, toAfters: GraphNode[]) {
  // toAfter : GeneralOrdering [0..*] (opposite GeneralOrdering::before)
  // References the GeneralOrderings that specify EventOcurrences that must occur after this OccurrenceSpecification.
  toAfters.forEach((toAfter) => {
    occurrenceSpecification.model.addEdge('toAfter', occurrenceSpecification, toAfter)
  })
}

function addEdge_toBefore(occurrenceSpecification: GraphNode, toBefores: GraphNode[]) {
  // toBefore : GeneralOrdering [0..*] (opposite GeneralOrdering::after)
  // References the GeneralOrderings that specify EventOcurrences that must occur before this OccurrenceSpecification.
  toBefores.forEach((toBefore) => {
    occurrenceSpecification.model.addEdge('toBefore', occurrenceSpecification, toBefore)
  })
}
