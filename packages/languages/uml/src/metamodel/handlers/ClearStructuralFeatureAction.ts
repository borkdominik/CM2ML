import type { GraphNode } from '@cm2ml/ir'

import { ClearStructuralFeatureAction } from '../uml-metamodel'

export const ClearStructuralFeatureActionHandler =
  ClearStructuralFeatureAction.createHandler(
    (clearStructuralFeatureAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(clearStructuralFeatureAction)
    },
  )

function addEdge_result(_clearStructuralFeatureAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [0..1]{subsets Action::output} (opposite A_result_clearStructuralFeatureAction::clearStructuralFeatureAction )
  // The OutputPin on which is put the input object as modified by the ClearStructuralFeatureAction.
}
