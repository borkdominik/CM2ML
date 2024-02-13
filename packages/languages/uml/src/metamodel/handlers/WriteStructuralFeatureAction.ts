import type { GraphNode } from '@cm2ml/ir'

import { WriteStructuralFeatureAction } from '../uml-metamodel'

export const WriteStructuralFeatureActionHandler =
  WriteStructuralFeatureAction.createHandler(
    (writeStructuralFeatureAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(writeStructuralFeatureAction)
      addEdge_value(writeStructuralFeatureAction)
    },
  )

function addEdge_result(_writeStructuralFeatureAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [0..1]{subsets Action::output} (opposite A_result_writeStructuralFeatureAction::writeStructuralFeatureAction)
  // The OutputPin on which is put the input object as modified by the WriteStructuralFeatureAction.
}

function addEdge_value(_writeStructuralFeatureAction: GraphNode) {
  // TODO/Association
  // ♦ value : InputPin [0..1]{subsets Action::input} (opposite A_value_writeStructuralFeatureAction::writeStructuralFeatureAction)
  // The InputPin that provides the value to be added or removed from the StructuralFeature.
}
