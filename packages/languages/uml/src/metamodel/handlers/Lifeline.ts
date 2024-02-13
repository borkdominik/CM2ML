import type { GraphNode } from '@cm2ml/ir'

import { Lifeline } from '../uml-metamodel'

export const LifelineHandler = Lifeline.createHandler(
  (lifeline, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_coveredBy(lifeline)
    addEdge_decomposedAs(lifeline)
    addEdge_interaction(lifeline)
    addEdge_represents(lifeline)
    addEdge_selector(lifeline)
  },
)

function addEdge_coveredBy(_lifeline: GraphNode) {
  // TODO/Association
  // coveredBy : InteractionFragment [0..*] (opposite InteractionFragment::covered)
  // References the InteractionFragments in which this Lifeline takes part.
}

function addEdge_decomposedAs(_lifeline: GraphNode) {
  // TODO/Association
  // decomposedAs : PartDecomposition [0..1] (opposite A_decomposedAs_lifeline::lifeline)
  // References the Interaction that represents the decomposition.
}

function addEdge_interaction(_lifeline: GraphNode) {
  // TODO/Association
  // interaction : Interaction [1..1]{subsets NamedElement::namespace} (opposite Interaction::lifeline)
  // References the Interaction enclosing this Lifeline.
}

function addEdge_represents(_lifeline: GraphNode) {
  // TODO/Association
  // represents : ConnectableElement [0..1] (opposite A_represents_lifeline::lifeline)
  // References the ConnectableElement within the classifier that contains the enclosing interaction.
}

function addEdge_selector(_lifeline: GraphNode) {
  // TODO/Association
  // ♦ selector : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_selector_lifeline::lifeline)
  // If the referenced ConnectableElement is multivalued, then this specifies the specific individual part within that set.
}
