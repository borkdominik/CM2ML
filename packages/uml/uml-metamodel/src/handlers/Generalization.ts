import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/fromAttribute'
import { Uml } from '../uml'
import { Classifier, Generalization } from '../uml-metamodel'

export const GeneralizationHandler = Generalization.createHandler(
  (generalization, { onlyContainmentAssociations }) => {
    const general = resolveFromAttribute(generalization, 'general', { required: true, type: Classifier })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_general(generalization, general)
    addEdge_generalizationSet(generalization)
    addEdge_specific(generalization)
  },
  {
    [Uml.Attributes.isSubstitutable]: 'true',
  },
)

function addEdge_general(generalization: GraphNode, general: GraphNode) {
  generalization.model.addEdge('general', generalization, general)
}

function addEdge_generalizationSet(_generalization: GraphNode) {
  // TODO/Association
  // generalizationSet : GeneralizationSet [0..*] (opposite GeneralizationSet::generalization)
  // Represents a set of instances of Generalization. A Generalization may appear in many GeneralizationSets.
}

function addEdge_specific(generalization: GraphNode) {
  const specific = getParentOfType(generalization, Classifier)
  if (!specific) {
    throw new Error('Generalization has no specific')
  }
  generalization.model.addEdge('specific', generalization, specific)
}
