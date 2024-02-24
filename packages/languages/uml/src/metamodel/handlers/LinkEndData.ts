import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { LinkEndData, Property } from '../uml-metamodel'

export const LinkEndDataHandler = LinkEndData.createHandler(
  (linkEndData, { onlyContainmentAssociations }) => {
    const end = resolve(linkEndData, 'end', { type: Property })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_end(linkEndData, end)
    addEdge_qualifier(linkEndData)
    addEdge_value(linkEndData)
  },
)

function addEdge_end(linkEndData: GraphNode, end: GraphNode | undefined) {
  // end : Property [1..1] (opposite A_end_linkEndData::linkEndData)
  // The Association end for which this LinkEndData specifies values.
  if (!end) {
    return
  }
  linkEndData.model.addEdge('end', linkEndData, end)
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
