import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { InputPin, LinkEndDestructionData } from '../uml-metamodel'

export const LinkEndDestructionDataHandler =
  LinkEndDestructionData.createHandler(
    (linkEndDestructionData, { onlyContainmentAssociations }) => {
      const destroyAt = resolve(linkEndDestructionData, 'destroyAt', { type: InputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_destroyAt(linkEndDestructionData, destroyAt)
    },
    {
      [Uml.Attributes.isDestroyDuplicates]: { type: 'boolean', defaultValue: 'false' },
    },
  )

function addEdge_destroyAt(linkEndDestructionData: GraphNode, destroyAt: GraphNode | undefined) {
  // destroyAt : InputPin [0..1] (opposite A_destroyAt_linkEndDestructionData::linkEndDestructionData)
  // The InputPin that provides the position of an existing link to be destroyed in an ordered, nonunique Association end. The type of the destroyAt InputPin is UnlimitedNatural, but the value cannot be zero or unlimited.
  if (!destroyAt) {
    return
  }
  linkEndDestructionData.model.addEdge('destroyAt', linkEndDestructionData, destroyAt)
}
