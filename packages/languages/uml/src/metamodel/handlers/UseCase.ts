import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute, resolveFromChild } from '../resolvers/resolve'
import { Extend, UseCase } from '../uml-metamodel'

export const UseCaseHandler = UseCase.createHandler(
  (useCase, { onlyContainmentAssociations }) => {
    const extends_ = resolveFromChild(useCase, 'extend', { many: true, type: Extend })
    const subjects = resolveFromAttribute(useCase, 'subject', { many: true })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_extend(useCase, extends_)
    addEdge_extensionPoint(useCase)
    addEdge_include(useCase)
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

function addEdge_subject(useCase: GraphNode, subjects: GraphNode[]) {
  // subject : Classifier [0..*] (opposite Classifier::useCase)
  // The subjects to which this UseCase applies. Each subject or its parts realize all the UseCases that apply to it.
  subjects.forEach((subject) => {
    useCase.model.addEdge('subject', useCase, subject)
  })
}
