import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import {
  Constraint,
  ElementImport,
  NamedElement,
  Namespace,
  PackageImport,
} from '../uml-metamodel'

export const NamespaceHandler = Namespace.createHandler(
  (namespace, { onlyContainmentAssociations }) => {
    const elementImports = resolve(namespace, 'elementImport', { many: true, type: ElementImport })
    const packageImports = resolve(namespace, 'packageImport', { many: true, type: PackageImport })
    const ownedRules = resolve(namespace, 'ownedRule', { many: true, type: Constraint })
    if (onlyContainmentAssociations) {
      return
    }
    namespace.children.forEach((child) => {
      addEdge_importedMember(namespace, child)
      addEdge_member(namespace, child)
      addEdge_ownedMember(namespace, child)
    })
    addEdge_elementImport(namespace, elementImports)
    addEdge_packageImport(namespace, packageImports)
    addEdge_ownedRule(namespace, ownedRules)
  },
)

function addEdge_elementImport(namespace: GraphNode, elementImports: GraphNode[]) {
  elementImports.forEach((elementImport) => {
    namespace.model.addEdge('elementImport', namespace, elementImport)
  })
}

// TODO/Association
function addEdge_importedMember(namespace: GraphNode, child: GraphNode) {
  if (ElementImport.isAssignable(child) || PackageImport.isAssignable(child)) {
    namespace.model.addEdge('importedMember', namespace, child)
  }
}

// TODO/Association
// TODO/Jan: Set with opposite (i.e., namespace)?
function addEdge_member(namespace: GraphNode, child: GraphNode) {
  if (NamedElement.isAssignable(child)) {
    namespace.model.addEdge('member', namespace, child)
  }
}

// TODO/Association
// TODO/Jan: Use resolve?
function addEdge_ownedMember(namespace: GraphNode, child: GraphNode) {
  if (NamedElement.isAssignable(child)) {
    namespace.model.addEdge('ownedMember', namespace, child)
  }
}

function addEdge_ownedRule(namespace: GraphNode, ownedRules: GraphNode[]) {
  // ♦ ownedRule : Constraint [0..*]{subsets Namespace::ownedMember} (opposite Constraint::context)
  // Specifies a set of Constraints owned by this Namespace.
  ownedRules.forEach((ownedRule) => {
    namespace.model.addEdge('ownedRule', namespace, ownedRule)
  })
}

function addEdge_packageImport(namespace: GraphNode, packageImports: GraphNode[]) {
  packageImports.forEach((packageImport) => {
    namespace.model.addEdge('packageImport', namespace, packageImport)
  })
}
