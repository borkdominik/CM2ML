import type { GraphNode } from '@cm2ml/ir'

import { ReadStructuralFeatureAction } from '../uml-metamodel'

export const ReadStructuralFeatureActionHandler =
  ReadStructuralFeatureAction.createHandler(
    (readStructuralFeatureAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(readStructuralFeatureAction)
    },
  )

function addEdge_result(_readStructuralFeatureAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readStructuralFeatureAction::readStructuralFeatureAction )
  // The OutputPin on which the result values are placed.
}
