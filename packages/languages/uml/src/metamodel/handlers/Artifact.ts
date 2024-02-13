import type { GraphNode } from '@cm2ml/ir'

import { Artifact } from '../uml-metamodel'

export const ArtifactHandler = Artifact.createHandler(
  (artifact, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_manifestation(artifact)
    addEdge_nestedArtifact(artifact)
    addEdge_ownedAttribute(artifact)
    addEdge_ownedOperation(artifact)
  },
)

function addEdge_manifestation(_artifact: GraphNode) {
  // TODO/Association
  // ♦ manifestation : Manifestation [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite A_manifestation_artifact::artifact)
  // The set of model elements that are manifested in the Artifact. That is, these model elements are utilized in the construction (or generation) of the artifact.
}

function addEdge_nestedArtifact(_artifact: GraphNode) {
  // TODO/Association
  // ♦ nestedArtifact : Artifact [0..*]{subsets Namespace::ownedMember} (opposite A_nestedArtifact_artifact::artifact)
  // The Artifacts that are defined (nested) within the Artifact. The association is a specialization of the ownedMember association from Namespace to NamedElement.
}

function addEdge_ownedAttribute(_artifact: GraphNode) {
  // TODO/Association
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets Namespace::ownedMember} (opposite A_ownedAttribute_artifact::artifact)
  // The attributes or association ends defined for the Artifact. The association is a specialization of the ownedMember association.
}

function addEdge_ownedOperation(_artifact: GraphNode) {
  // TODO/Association
  // ♦ ownedOperation : Operation [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite A_ownedOperation_artifact::artifact)
  // The Operations defined for the Artifact. The association is a specialization of the ownedMember association.
}
