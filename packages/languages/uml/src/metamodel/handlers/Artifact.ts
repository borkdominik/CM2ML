import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Artifact, Manifestation, Property } from '../uml-metamodel'

export const ArtifactHandler = Artifact.createHandler(
  (artifact, { onlyContainmentAssociations }) => {
    const manifestations = resolve(artifact, 'manifestation', { many: true, type: Manifestation })
    const nestedArtifacts = resolve(artifact, 'nestedArtifact', { many: true, type: Artifact })
    const ownedAttributes = resolve(artifact, 'ownedAttribute', { many: true, type: Property })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_manifestation(artifact, manifestations)
    addEdge_nestedArtifact(artifact, nestedArtifacts)
    addEdge_ownedAttribute(artifact, ownedAttributes)
    addEdge_ownedOperation(artifact)
  },
)

function addEdge_manifestation(artifact: GraphNode, manifestations: GraphNode[]) {
  // ♦ manifestation : Manifestation [0..*]{subsets Element::ownedElement, subsets NamedElement::clientDependency} (opposite A_manifestation_artifact::artifact)
  // The set of model elements that are manifested in the Artifact. That is, these model elements are utilized in the construction (or generation) of the artifact.
  manifestations.forEach((manifestation) => {
    artifact.model.addEdge('manifestation', artifact, manifestation)
  })
}

function addEdge_nestedArtifact(artifact: GraphNode, nestedArtifacts: GraphNode[]) {
  // ♦ nestedArtifact : Artifact [0..*]{subsets Namespace::ownedMember} (opposite A_nestedArtifact_artifact::artifact)
  // The Artifacts that are defined (nested) within the Artifact. The association is a specialization of the ownedMember association from Namespace to NamedElement.
  nestedArtifacts.forEach((nestedArtifact) => {
    artifact.model.addEdge('nestedArtifact', artifact, nestedArtifact)
  })
}

function addEdge_ownedAttribute(artifact: GraphNode, ownedAttributes: GraphNode[]) {
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets Namespace::ownedMember} (opposite A_ownedAttribute_artifact::artifact)
  // The attributes or association ends defined for the Artifact. The association is a specialization of the ownedMember association.
  ownedAttributes.forEach((ownedAttribute) => {
    artifact.model.addEdge('ownedAttribute', artifact, ownedAttribute)
  })
}

function addEdge_ownedOperation(_artifact: GraphNode) {
  // TODO/Association
  // ♦ ownedOperation : Operation [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite A_ownedOperation_artifact::artifact)
  // The Operations defined for the Artifact. The association is a specialization of the ownedMember association.
}
