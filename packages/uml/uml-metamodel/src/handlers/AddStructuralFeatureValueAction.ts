import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { AddStructuralFeatureValueAction } from '../uml-metamodel'

export const AddStructuralFeatureValueActionHandler =
  AddStructuralFeatureValueAction.createHandler(
    (addStructuralFeatureValueAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_insertAt(addStructuralFeatureValueAction)
    },
    {
      [Uml.Attributes.isReplaceAll]: 'false',
    },
  )

function addEdge_insertAt(_addStructuralFeatureValueAction: GraphNode) {
  // TODO/Association
  // ♦ insertAt : InputPin [0..1]{subsets Action::input} (opposite A_insertAt_addStructuralFeatureValueAction::addStructuralFeatureValueAction )
  // The InputPin that gives the position at which to insert the value in an ordered StructuralFeature. The type of the insertAt InputPin is UnlimitedNatural, but the value cannot be zero. It is omitted for unordered StructuralFeatures.
}
