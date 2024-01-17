import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { Component, ComponentRealization } from '../uml-metamodel'

export const ComponentRealizationHandler = ComponentRealization.createHandler(
  (componentRealization, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_abstraction(componentRealization)
    addEdge_realizingClassifier(componentRealization)
  },
)

function addEdge_abstraction(componentRealization: GraphNode) {
  const abstraction = getParentOfType(componentRealization, Component)
  if (!abstraction) {
    return
  }
  componentRealization.model.addEdge(
    'abstraction',
    componentRealization,
    abstraction,
  )
}

function addEdge_realizingClassifier(_componentRealization: GraphNode) {
  // TODO
  // realizingClassifier: Classifier[1..*]{subsets Dependency:: client } (opposite A_realizingClassifier_componentRealization::componentRealization)
  // The Classifiers that are involved in the implementation of the Component that owns this Realization.
}
