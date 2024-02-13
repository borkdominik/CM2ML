import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { LinkEndCreationData } from '../uml-metamodel'

export const LinkEndCreationDataHandler = LinkEndCreationData.createHandler(
  (linkEndCreationData, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_insertAt(linkEndCreationData)
  },
  {
    [Uml.Attributes.isReplaceAll]: 'false',
  },
)

function addEdge_insertAt(_linkEndCreationData: GraphNode) {
  // TODO/Association
  // insertAt : InputPin [0..1] (opposite A_insertAt_linkEndCreationData::linkEndCreationData)
  // For ordered Association ends, the InputPin that provides the position where the new link should be inserted or where an existing link should be moved to. The type of the insertAt InputPin is UnlimitedNatural, but the input cannot be zero. It is omitted for Association ends that are not ordered.
}
