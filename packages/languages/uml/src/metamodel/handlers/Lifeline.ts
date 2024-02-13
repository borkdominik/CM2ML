import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/fromAttribute'
import { Lifeline } from '../uml-metamodel'

export const LifelineHandler = Lifeline.createHandler(
  (lifeline, { onlyContainmentAssociations }) => {
    const coveredBy = resolveFromAttribute(lifeline, 'coveredBy', { many: true })
    const decomposedAs = resolveFromAttribute(lifeline, 'decomposedAs')
    const represents = resolveFromAttribute(lifeline, 'represents')
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
  // TODO/Association
  // coveredBy : InteractionFragment [0..*] (opposite InteractionFragment::covered)
  // References the InteractionFragments in which this Lifeline takes part.
  coveredBy.forEach((coveredBy) => {
    lifeline.model.addEdge('coveredBy', lifeline, coveredBy)
  })
}

function addEdge_decomposedAs(lifeline: GraphNode, decomposedAs: GraphNode | undefined) {
  // TODO/Association
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
  // TODO/Association
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
