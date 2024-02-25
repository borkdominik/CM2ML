import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ClearStructuralFeatureAction, OutputPin } from '../uml-metamodel'

export const ClearStructuralFeatureActionHandler =
  ClearStructuralFeatureAction.createHandler(
    (clearStructuralFeatureAction, { onlyContainmentAssociations }) => {
      const result = resolve(clearStructuralFeatureAction, 'result', { type: OutputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(clearStructuralFeatureAction, result)
    },
  )

function addEdge_result(clearStructuralFeatureAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [0..1]{subsets Action::output} (opposite A_result_clearStructuralFeatureAction::clearStructuralFeatureAction )
  // The OutputPin on which is put the input object as modified by the ClearStructuralFeatureAction.
  if (!result) {
    return
  }
  clearStructuralFeatureAction.model.addEdge('result', clearStructuralFeatureAction, result)
}
