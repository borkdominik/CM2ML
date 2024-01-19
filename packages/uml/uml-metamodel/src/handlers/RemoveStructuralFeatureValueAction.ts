import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { RemoveStructuralFeatureValueAction } from '../uml-metamodel'

export const RemoveStructuralFeatureValueActionHandler =
  RemoveStructuralFeatureValueAction.createHandler(
    (removeStructuralFeatureValueAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_removeAt(removeStructuralFeatureValueAction)
    },
    {
      [Uml.Attributes.isRemoveDuplicates]: 'false',
    },
  )

function addEdge_removeAt(_removeStructuralFeatureValueAction: GraphNode) {
  // TODO/Association
  // ♦ removeAt : InputPin [0..1]{subsets Action::input} (opposite A_removeAt_removeStructuralFeatureValueAction::removeStructuralFeatureValueAction )
  // An InputPin that provides the position of an existing value to remove in ordered, nonunique structural features. The type of the removeAt InputPin is UnlimitedNatural, but the value cannot be zero or unlimited.
}
