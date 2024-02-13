import type { GraphNode } from '@cm2ml/ir'

import { StructuralFeatureAction } from '../uml-metamodel'

export const StructuralFeatureActionHandler =
  StructuralFeatureAction.createHandler(
    (structuralFeatureAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_object(structuralFeatureAction)
      addEdge_structuralFeature(structuralFeatureAction)
    },
  )

function addEdge_object(_structuralFeatureAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_structuralFeatureAction::structuralFeatureAction)
  // The InputPin from which the object whose StructuralFeature is to be read or written is obtained.
}

function addEdge_structuralFeature(_structuralFeatureAction: GraphNode) {
  // TODO/Association
  // structuralFeature : StructuralFeature [1..1] (opposite A_structuralFeature_structuralFeatureAction::structuralFeatureAction)
  // The StructuralFeature to be read or written.
}
