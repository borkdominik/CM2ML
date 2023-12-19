import type { GraphNode } from '@cm2ml/ir'

import { Generalization } from '../metamodel'

export const GeneralizationHandler = Generalization.createHandler(
  (generalization) => {
    addEdge_general(generalization)
    addEdge_generalizationSet(generalization)
    addEdge_specific(generalization)
  },
)

function addEdge_general(_generalization: GraphNode) {
  // TODO
  // general : Classifier [1..1]{subsets DirectedRelationship::target} (opposite A_general_generalization::generalization)
  // The general classifier in the Generalization relationship.
}

function addEdge_generalizationSet(_generalization: GraphNode) {
  // TODO
  // generalizationSet : GeneralizationSet [0..*] (opposite GeneralizationSet::generalization)
  // Represents a set of instances of Generalization. A Generalization may appear in many GeneralizationSets.
}

function addEdge_specific(_generalization: GraphNode) {
  // TODO
  // specific : Classifier [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Classifier::generalization)
  // The specializing Classifier in the Generalization relationship.
}
