import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { InputPin, LinkEndCreationData } from '../uml-metamodel'

export const LinkEndCreationDataHandler = LinkEndCreationData.createHandler(
  (linkEndCreationData, { onlyContainmentAssociations }) => {
    const insertAt = resolve(linkEndCreationData, 'insertAt', { type: InputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_insertAt(linkEndCreationData, insertAt)
  },
  {
    [Uml.Attributes.isReplaceAll]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_insertAt(linkEndCreationData: GraphNode, insertAt: GraphNode | undefined) {
  // insertAt : InputPin [0..1] (opposite A_insertAt_linkEndCreationData::linkEndCreationData)
  // For ordered Association ends, the InputPin that provides the position where the new link should be inserted or where an existing link should be moved to. The type of the insertAt InputPin is UnlimitedNatural, but the input cannot be zero. It is omitted for Association ends that are not ordered.
  if (!insertAt) {
    return
  }
  linkEndCreationData.model.addEdge('insertAt', linkEndCreationData, insertAt)
}
