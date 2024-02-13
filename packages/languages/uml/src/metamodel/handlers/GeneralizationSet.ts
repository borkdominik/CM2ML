import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { GeneralizationSet } from '../uml-metamodel'

export const GeneralizationSetHandler = GeneralizationSet.createHandler(
  (generalizationSet, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_generalization(generalizationSet)
    addEdge_powertype(generalizationSet)
  },
  {
    [Uml.Attributes.isCovering]: 'false',
    [Uml.Attributes.isDisjoint]: 'false',
  },
)

function addEdge_generalization(_generalizationSet: GraphNode) {
  // TODO/Association
  // generalization : Generalization [0..*] (opposite Generalization::generalizationSet)
  // Designates the instances of Generalization that are members of this GeneralizationSet.
}

function addEdge_powertype(_generalizationSet: GraphNode) {
  // TODO/Association
  // powertype : Classifier [0..1] (opposite Classifier::powertypeExtent)
  // Designates the Classifier that is defined as the power type for the associated GeneralizationSet, if there is one.
}
