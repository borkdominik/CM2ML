import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { Classifier, Generalization, GeneralizationSet } from '../uml-metamodel'

export const GeneralizationHandler = Generalization.createHandler(
  (generalization, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const general = resolve(generalization, 'general', { type: Classifier })
    const generalizationSets = resolve(generalization, 'generalizationSet', { many: true, type: GeneralizationSet })
    const specific = getParentOfType(generalization, Classifier)
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(generalization, general, specific)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_general(generalization, general)
    addEdge_generalizationSet(generalization, generalizationSets)
    addEdge_specific(generalization, specific)
  },
  {
    [Uml.Attributes.isSubstitutable]: 'true',
  },
)

function addEdge_general(generalization: GraphNode, general: GraphNode | undefined) {
  if (!general) {
    return
  }
  generalization.model.addEdge('general', generalization, general)
}

function addEdge_generalizationSet(generalization: GraphNode, generalizationSets: GraphNode[]) {
  // generalizationSet : GeneralizationSet [0..*] (opposite GeneralizationSet::generalization)
  // Represents a set of instances of Generalization. A Generalization may appear in many GeneralizationSets.
  generalizationSets.forEach((generalizationSet) => {
    generalization.model.addEdge('generalizationSet', generalization, generalizationSet)
  })
}

function addEdge_specific(generalization: GraphNode, specific: GraphNode | undefined) {
  if (!specific) {
    return
  }
  generalization.model.addEdge('specific', generalization, specific)
}