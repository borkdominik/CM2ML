import type { GraphNode } from '@cm2ml/ir'

import { DirectedRelationship } from '../uml-metamodel'

export const DirectedRelationshipHandler = DirectedRelationship.createHandler(
  (directedRelationship, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_source(directedRelationship)
    addEdge_target(directedRelationship)
  },
)

function addEdge_source(_directedRelationship: GraphNode) {
  // /source : Element [1..*]{union, subsets Relationship::relatedElement} (opposite A_source_directedRelationship::directedRelationship)
  // Specifies the source Element(s) of the DirectedRelationship.

  // Added by DependencyHandler::addEdge_client, ElementImportHandler::addEdge_importingNamespace, ExtendHandler::addEdge_extension, GeneralizationHandler::addEdge_specific, IncludeHandler::addEdge_includingCase, InformationFlowHandler::addEdge_informationSource, PackageImportHandler::addEdge_importingNamespace, PackageMergeHandler::addEdge_receivingPackage, ProfileApplicationHandler::addEdge_applyingPackage, ProtocolConformanceHandler::addEdge_specificMachine, TemplateBindingHandler::addEdge_signature
}

function addEdge_target(_directedRelationship: GraphNode) {
  // /target : Element [1..*]{union, subsets Relationship::relatedElement} (opposite A_target_directedRelationship::directedRelationship)
  // Specifies the target Element(s) of the DirectedRelationship.

  // Added by DependencyHandler::addEdge_supplier, ElementImportHandler::addEdge_importedElement, ExtendHandler::addEdge_extendedCase, GeneralizationHandler::addEdge_general, IncludeHandler::addEdge_addition, InformationFlowHandler::addEdge_informationTarget, PackageImportHandler::addEdge_importedPackage, PackageMergeHandler::addEdge_mergedPackage, ProfileApplicationHandler::addEdge_appliedProfile, ProtocolConformanceHandler::addEdge_generalMachine, TemplateBindingHandler::addEdge_boundElement
}
