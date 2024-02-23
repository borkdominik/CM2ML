import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType, transformNodeToEdge } from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Classifier, Generalization } from '../uml-metamodel'

export const GeneralizationHandler = Generalization.createHandler(
  (generalization, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const general = resolveFromAttribute(generalization, 'general', { type: Classifier })
    const generalizationSets = resolveFromAttribute(generalization, 'generalizationSet', { many: true })
    const specific = getParentOfType(generalization, Classifier)
    if (relationshipsAsEdges) {
      const edgeTag = Uml.getEdgeTagForRelationship(generalization)
      // TODO/Jan: Validate edge direction
      transformNodeToEdge(generalization, general, specific, edgeTag)
      return false
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
