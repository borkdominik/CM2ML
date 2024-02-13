import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { LinkEndDestructionData } from '../uml-metamodel'

export const LinkEndDestructionDataHandler =
  LinkEndDestructionData.createHandler(
    (linkEndDestructionData, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_destroyAt(linkEndDestructionData)
    },
    {
      [Uml.Attributes.isDestroyDuplicates]: 'false',
    },
  )

function addEdge_destroyAt(_linkEndDestructionData: GraphNode) {
  // TODO/Association
  // destroyAt : InputPin [0..1] (opposite A_destroyAt_linkEndDestructionData::linkEndDestructionData)
  // The InputPin that provides the position of an existing link to be destroyed in an ordered, nonunique Association end. The type of the destroyAt InputPin is UnlimitedNatural, but the value cannot be zero or unlimited.
}
