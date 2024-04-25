import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Classifier, Generalization, GeneralizationSet } from '../uml-metamodel'

export const GeneralizationSetHandler = GeneralizationSet.createHandler(
  (generalizationSet, { onlyContainmentAssociations }) => {
    const generalizations = resolve(generalizationSet, 'generalization', { many: true, type: Generalization })
    const powertype = resolve(generalizationSet, 'powertype', { type: Classifier })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_generalization(generalizationSet, generalizations)
    addEdge_powertype(generalizationSet, powertype)
  },
  {
    [Uml.Attributes.isCovering]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isDisjoint]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_generalization(generalizationSet: GraphNode, generalizations: GraphNode[]) {
  // generalization : Generalization [0..*] (opposite Generalization::generalizationSet)
  // Designates the instances of Generalization that are members of this GeneralizationSet.
  generalizations.forEach((generalization) => {
    generalizationSet.model.addEdge('generalization', generalizationSet, generalization)
  })
}

function addEdge_powertype(generalizationSet: GraphNode, powertype: GraphNode | undefined) {
  // powertype : Classifier [0..1] (opposite Classifier::powertypeExtent)
  // Designates the Classifier that is defined as the power type for the associated GeneralizationSet, if there is one.
  if (!powertype) {
    return
  }
  generalizationSet.model.addEdge('powertype', generalizationSet, powertype)
}
