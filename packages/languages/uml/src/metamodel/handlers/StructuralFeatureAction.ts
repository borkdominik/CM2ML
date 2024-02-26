import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute, resolveFromChild } from '../resolvers/resolve'
import { InputPin, StructuralFeature, StructuralFeatureAction } from '../uml-metamodel'

export const StructuralFeatureActionHandler =
  StructuralFeatureAction.createHandler(
    (structuralFeatureAction, { onlyContainmentAssociations }) => {
      const object = resolveFromChild(structuralFeatureAction, 'object', { type: InputPin })
      const structuralFeature = resolveFromAttribute(structuralFeatureAction, 'structuralFeature', { type: StructuralFeature })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_object(structuralFeatureAction, object)
      addEdge_structuralFeature(structuralFeatureAction, structuralFeature)
    },
  )

function addEdge_object(structuralFeatureAction: GraphNode, object: GraphNode | undefined) {
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_structuralFeatureAction::structuralFeatureAction)
  // The InputPin from which the object whose StructuralFeature is to be read or written is obtained.
  if (!object) {
    return
  }
  structuralFeatureAction.model.addEdge('object', structuralFeatureAction, object)
}

function addEdge_structuralFeature(structuralFeatureAction: GraphNode, structuralFeature: GraphNode | undefined) {
  // structuralFeature : StructuralFeature [1..1] (opposite A_structuralFeature_structuralFeatureAction::structuralFeatureAction)
  // The StructuralFeature to be read or written.
  if (!structuralFeature) {
    return
  }
  structuralFeatureAction.model.addEdge('structuralFeature', structuralFeatureAction, structuralFeature)
}
