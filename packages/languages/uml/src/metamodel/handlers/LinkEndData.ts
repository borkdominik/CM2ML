import type { GraphNode } from '@cm2ml/ir'

import { LinkEndData } from '../uml-metamodel'

export const LinkEndDataHandler = LinkEndData.createHandler(
  (linkEndData, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_end(linkEndData)
    addEdge_qualifier(linkEndData)
    addEdge_value(linkEndData)
  },
)

function addEdge_end(_linkEndData: GraphNode) {
  // TODO/Association
  // end : Property [1..1] (opposite A_end_linkEndData::linkEndData)
  // The Association end for which this LinkEndData specifies values.
}

function addEdge_qualifier(_linkEndData: GraphNode) {
  // TODO/Association
  // ♦ qualifier : QualifierValue [0..*]{subsets Element::ownedElement} (opposite A_qualifier_linkEndData::linkEndData)
  // A set of QualifierValues used to provide values for the qualifiers of the end.
}

function addEdge_value(_linkEndData: GraphNode) {
  // TODO/Association
  // value : InputPin [0..1] (opposite A_value_linkEndData::linkEndData)
  // The InputPin that provides the specified value for the given end. This InputPin is omitted if the LinkEndData specifies the "open" end for a ReadLinkAction.
}
