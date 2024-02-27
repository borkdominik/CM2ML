import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InputPin, OutputPin, WriteStructuralFeatureAction } from '../uml-metamodel'

export const WriteStructuralFeatureActionHandler =
  WriteStructuralFeatureAction.createHandler(
    (writeStructuralFeatureAction, { onlyContainmentAssociations }) => {
      const result = resolve(writeStructuralFeatureAction, 'result', { type: OutputPin })
      const value = resolve(writeStructuralFeatureAction, 'value', { type: InputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(writeStructuralFeatureAction, result)
      addEdge_value(writeStructuralFeatureAction, value)
    },
  )

function addEdge_result(writeStructuralFeatureAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [0..1]{subsets Action::output} (opposite A_result_writeStructuralFeatureAction::writeStructuralFeatureAction)
  // The OutputPin on which is put the input object as modified by the WriteStructuralFeatureAction.
  if (!result) {
    return
  }
  writeStructuralFeatureAction.model.addEdge('result', writeStructuralFeatureAction, result)
}

function addEdge_value(writeStructuralFeatureAction: GraphNode, value: GraphNode | undefined) {
  // ♦ value : InputPin [0..1]{subsets Action::input} (opposite A_value_writeStructuralFeatureAction::writeStructuralFeatureAction)
  // The InputPin that provides the value to be added or removed from the StructuralFeature.
  if (!value) {
    return
  }
  writeStructuralFeatureAction.model.addEdge('value', writeStructuralFeatureAction, value)
}
