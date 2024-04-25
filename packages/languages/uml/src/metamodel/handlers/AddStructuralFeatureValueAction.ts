import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { AddStructuralFeatureValueAction, InputPin } from '../uml-metamodel'

export const AddStructuralFeatureValueActionHandler =
  AddStructuralFeatureValueAction.createHandler(
    (addStructuralFeatureValueAction, { onlyContainmentAssociations }) => {
      const insertAt = resolve(addStructuralFeatureValueAction, 'insertAt', { type: InputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_insertAt(addStructuralFeatureValueAction, insertAt)
    },
    {
      [Uml.Attributes.isReplaceAll]: { type: 'boolean', defaultValue: 'false' },
    },
  )

function addEdge_insertAt(addStructuralFeatureValueAction: GraphNode, insertAt: GraphNode | undefined) {
  // ♦ insertAt : InputPin [0..1]{subsets Action::input} (opposite A_insertAt_addStructuralFeatureValueAction::addStructuralFeatureValueAction )
  // The InputPin that gives the position at which to insert the value in an ordered StructuralFeature. The type of the insertAt InputPin is UnlimitedNatural, but the value cannot be zero. It is omitted for unordered StructuralFeatures.
  if (!insertAt) {
    return
  }
  addStructuralFeatureValueAction.model.addEdge('insertAt', addStructuralFeatureValueAction, insertAt)
}
