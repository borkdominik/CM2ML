import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { InputPin, RemoveStructuralFeatureValueAction } from '../uml-metamodel'

export const RemoveStructuralFeatureValueActionHandler =
  RemoveStructuralFeatureValueAction.createHandler(
    (removeStructuralFeatureValueAction, { onlyContainmentAssociations }) => {
      const removeAt = resolve(removeStructuralFeatureValueAction, 'removeAt', { type: InputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_removeAt(removeStructuralFeatureValueAction, removeAt)
    },
    {
      [Uml.Attributes.isRemoveDuplicates]: 'false',
    },
  )

function addEdge_removeAt(removeStructuralFeatureValueAction: GraphNode, removeAt: GraphNode | undefined) {
  // ♦ removeAt : InputPin [0..1]{subsets Action::input} (opposite A_removeAt_removeStructuralFeatureValueAction::removeStructuralFeatureValueAction )
  // An InputPin that provides the position of an existing value to remove in ordered, nonunique structural features. The type of the removeAt InputPin is UnlimitedNatural, but the value cannot be zero or unlimited.
  if (!removeAt) {
    return
  }
  removeStructuralFeatureValueAction.model.addEdge('removeAt', removeStructuralFeatureValueAction, removeAt)
}
