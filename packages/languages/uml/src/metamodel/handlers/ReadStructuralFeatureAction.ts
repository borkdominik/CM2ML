import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { OutputPin, ReadStructuralFeatureAction } from '../uml-metamodel'

export const ReadStructuralFeatureActionHandler =
  ReadStructuralFeatureAction.createHandler(
    (readStructuralFeatureAction, { onlyContainmentAssociations }) => {
      const result = resolveFromChild(readStructuralFeatureAction, 'result', { type: OutputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(readStructuralFeatureAction, result)
    },
  )

function addEdge_result(readStructuralFeatureAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readStructuralFeatureAction::readStructuralFeatureAction )
  // The OutputPin on which the result values are placed.
  if (!result) {
    return
  }
  readStructuralFeatureAction.model.addEdge('result', readStructuralFeatureAction, result)
}
