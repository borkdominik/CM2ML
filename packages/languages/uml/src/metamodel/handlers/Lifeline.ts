import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ConnectableElement, InteractionFragment, Lifeline, PartDecomposition } from '../uml-metamodel'

export const LifelineHandler = Lifeline.createHandler(
  (lifeline, { onlyContainmentAssociations }) => {
    const coveredBy = resolve(lifeline, 'coveredBy', { many: true, type: InteractionFragment })
    const decomposedAs = resolve(lifeline, 'decomposedAs', { type: PartDecomposition })
    const represents = resolve(lifeline, 'represents', { type: ConnectableElement })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_coveredBy(lifeline, coveredBy)
    addEdge_decomposedAs(lifeline, decomposedAs)
    addEdge_interaction(lifeline)
    addEdge_represents(lifeline, represents)
    addEdge_selector(lifeline)
  },
)

function addEdge_coveredBy(lifeline: GraphNode, coveredBy: GraphNode[]) {
  // coveredBy : InteractionFragment [0..*] (opposite InteractionFragment::covered)
  // References the InteractionFragments in which this Lifeline takes part.
  coveredBy.forEach((coveredBy) => {
    lifeline.model.addEdge('coveredBy', lifeline, coveredBy)
  })
}

function addEdge_decomposedAs(lifeline: GraphNode, decomposedAs: GraphNode | undefined) {
  // decomposedAs : PartDecomposition [0..1] (opposite A_decomposedAs_lifeline::lifeline)
  // References the Interaction that represents the decomposition.
  if (!decomposedAs) {
    return
  }
  lifeline.model.addEdge('decomposedAs', lifeline, decomposedAs)
}

function addEdge_interaction(_lifeline: GraphNode) {
  // TODO/Association
  // interaction : Interaction [1..1]{subsets NamedElement::namespace} (opposite Interaction::lifeline)
  // References the Interaction enclosing this Lifeline.
}

function addEdge_represents(lifeline: GraphNode, represents: GraphNode | undefined) {
  // represents : ConnectableElement [0..1] (opposite A_represents_lifeline::lifeline)
  // References the ConnectableElement within the classifier that contains the enclosing interaction.
  if (!represents) {
    return
  }
  lifeline.model.addEdge('represents', lifeline, represents)
}

function addEdge_selector(_lifeline: GraphNode) {
  // TODO/Association
  // ♦ selector : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_selector_lifeline::lifeline)
  // If the referenced ConnectableElement is multivalued, then this specifies the specific individual part within that set.
}
