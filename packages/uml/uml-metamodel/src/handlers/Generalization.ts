import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { Uml } from '../uml'
import { Classifier, Generalization } from '../uml-metamodel'

export const GeneralizationHandler = Generalization.createHandler(
  (generalization, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_general(generalization)
    addEdge_generalizationSet(generalization)
    addEdge_specific(generalization)
  },
)

function addEdge_general(generalization: GraphNode) {
  const generalId = generalization.getAttribute(Uml.Attributes.general)?.value
    .literal
  if (!generalId) {
    throw new Error('Generalization has no general')
  }
  const general = generalization.model.getNodeById(generalId)
  if (!general) {
    throw new Error(`Generalization has invalid general ${generalId}`)
  }
  generalization.model.addEdge('general', generalization, general)
}

function addEdge_generalizationSet(_generalization: GraphNode) {
  // TODO
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
