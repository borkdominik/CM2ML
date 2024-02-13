import type { GraphNode } from '@cm2ml/ir'

import { UseCase } from '../uml-metamodel'

export const UseCaseHandler = UseCase.createHandler(
  (useCase, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_extend(useCase)
    addEdge_extensionPoint(useCase)
    addEdge_include(useCase)
    addEdge_subject(useCase)
  },
)

function addEdge_extend(_useCase: GraphNode) {
  // TODO/Association
  // ♦ extend : Extend [0..*]{subsets A_source_directedRelationship::directedRelationship, subsets Namespace::ownedMember} (opposite Extend::extension)
  // The Extend relationships owned by this UseCase.
}

function addEdge_extensionPoint(_useCase: GraphNode) {
  // TODO/Association
  // ♦ extensionPoint : ExtensionPoint [0..*]{subsets Namespace::ownedMember} (opposite ExtensionPoint::useCase)
  // The ExtensionPoints owned by this UseCase.
}

function addEdge_include(_useCase: GraphNode) {
  // TODO/Association
  // ♦ include : Include [0..*]{subsets A_source_directedRelationship::directedRelationship, subsets Namespace::ownedMember} (opposite Include::includingCase)
  // The Include relationships owned by this UseCase.
}

function addEdge_subject(_useCase: GraphNode) {
  // TODO/Association
  // subject : Classifier [0..*] (opposite Classifier::useCase)
  // The subjects to which this UseCase applies. Each subject or its parts realize all the UseCases that apply to it.
}
