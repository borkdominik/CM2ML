import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { StructuralFeatureAction } from '../uml-metamodel'

export const StructuralFeatureActionHandler =
  StructuralFeatureAction.createHandler(
    (structuralFeatureAction, { onlyContainmentAssociations }) => {
      const structuralFeature = resolveFromAttribute(structuralFeatureAction, 'structuralFeature')
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_object(structuralFeatureAction)
      addEdge_structuralFeature(structuralFeatureAction, structuralFeature)
    },
  )

function addEdge_object(_structuralFeatureAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_structuralFeatureAction::structuralFeatureAction)
  // The InputPin from which the object whose StructuralFeature is to be read or written is obtained.
}

function addEdge_structuralFeature(structuralFeatureAction: GraphNode, structuralFeature: GraphNode | undefined) {
  // structuralFeature : StructuralFeature [1..1] (opposite A_structuralFeature_structuralFeatureAction::structuralFeatureAction)
  // The StructuralFeature to be read or written.
  if (!structuralFeature) {
    return
  }
  structuralFeatureAction.model.addEdge('structuralFeature', structuralFeatureAction, structuralFeature)
}
