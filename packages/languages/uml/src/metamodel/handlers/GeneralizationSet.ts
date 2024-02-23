import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { GeneralizationSet } from '../uml-metamodel'

export const GeneralizationSetHandler = GeneralizationSet.createHandler(
  (generalizationSet, { onlyContainmentAssociations }) => {
    const generalizations = resolveFromAttribute(generalizationSet, 'generalization', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_generalization(generalizationSet, generalizations)
    addEdge_powertype(generalizationSet)
  },
  {
    [Uml.Attributes.isCovering]: 'false',
    [Uml.Attributes.isDisjoint]: 'false',
  },
)

function addEdge_generalization(generalizationSet: GraphNode, generalizations: GraphNode[]) {
  // generalization : Generalization [0..*] (opposite Generalization::generalizationSet)
  // Designates the instances of Generalization that are members of this GeneralizationSet.
  generalizations.forEach((generalization) => {
    generalizationSet.model.addEdge('generalization', generalizationSet, generalization)
  })
}

function addEdge_powertype(_generalizationSet: GraphNode) {
  // TODO/Association
  // powertype : Classifier [0..1] (opposite Classifier::powertypeExtent)
  // Designates the Classifier that is defined as the power type for the associated GeneralizationSet, if there is one.
}
