import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Classifier, Extend, ExtensionPoint, Include, UseCase } from '../uml-metamodel'

export const UseCaseHandler = UseCase.createHandler(
  (useCase, { onlyContainmentAssociations }) => {
    const extends_ = resolve(useCase, 'extend', { many: true, type: Extend })
    const extensionPoints = resolve(useCase, 'extensionPoint', { many: true, type: ExtensionPoint })
    const includes = resolve(useCase, 'include', { many: true, type: Include })
    const subjects = resolve(useCase, 'subject', { many: true, type: Classifier })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_extend(useCase, extends_)
    addEdge_extensionPoint(useCase, extensionPoints)
    addEdge_include(useCase, includes)
    addEdge_subject(useCase, subjects)
  },
)

function addEdge_extend(useCase: GraphNode, extends_: GraphNode[]) {
  // ♦ extend : Extend [0..*]{subsets A_source_directedRelationship::directedRelationship, subsets Namespace::ownedMember} (opposite Extend::extension)
  // The Extend relationships owned by this UseCase.
  extends_.forEach((extend) => {
    useCase.model.addEdge('extend', useCase, extend)
  })
}

function addEdge_extensionPoint(useCase: GraphNode, extensionPoints: GraphNode[]) {
  // ♦ extensionPoint : ExtensionPoint [0..*]{subsets Namespace::ownedMember} (opposite ExtensionPoint::useCase)
  // The ExtensionPoints owned by this UseCase.
  extensionPoints.forEach((extensionPoint) => {
    useCase.model.addEdge('extensionPoint', useCase, extensionPoint)
  })
}

function addEdge_include(useCase: GraphNode, includes: GraphNode[]) {
  // ♦ include : Include [0..*]{subsets A_source_directedRelationship::directedRelationship, subsets Namespace::ownedMember} (opposite Include::includingCase)
  // The Include relationships owned by this UseCase.
  includes.forEach((include) => {
    useCase.model.addEdge('include', useCase, include)
  })
}

function addEdge_subject(useCase: GraphNode, subjects: GraphNode[]) {
  // subject : Classifier [0..*] (opposite Classifier::useCase)
  // The subjects to which this UseCase applies. Each subject or its parts realize all the UseCases that apply to it.
  subjects.forEach((subject) => {
    useCase.model.addEdge('subject', useCase, subject)
  })
}
