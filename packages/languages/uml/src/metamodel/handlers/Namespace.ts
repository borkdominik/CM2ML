import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import {
  Constraint,
  ElementImport,
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
    addEdge_elementImport(namespace, elementImports)
    addEdge_importedMember(namespace, elementImports, packageImports)
    addEdge_member(namespace)
    addEdge_packageImport(namespace, packageImports)
    addEdge_ownedMember(namespace)
    addEdge_ownedRule(namespace, ownedRules)
  },
)

function addEdge_elementImport(namespace: GraphNode, elementImports: GraphNode[]) {
  // ♦ elementImport : ElementImport [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite ElementImport::importingNamespace)
  // References the ElementImports owned by the Namespace.
  elementImports.forEach((elementImport) => {
    namespace.model.addEdge('elementImport', namespace, elementImport)
  })
}

function addEdge_importedMember(_namespace: GraphNode, _elementImports: GraphNode[], _packageImports: GraphNode[]) {
  // /importedMember : PackageableElement [0..*]{subsets Namespace::member} (opposite A_importedMember_namespace::namespace)
  // References the PackageableElements that are members of this Namespace as a result of either PackageImports or ElementImports.

  // Added by ElementImportHandler::addEdge_importedMember_member, resolveImportedMembers
}

function addEdge_member(_namespace: GraphNode) {
  // /member : NamedElement [0..*]{union} (opposite A_member_memberNamespace::memberNamespace)
  // A collection of NamedElements identifiable within the Namespace, either by being owned or by being introduced by importing or inheritance.

  // Added by addEdge_importedMember, ClassifierHandler::addEdge_inheritedMember, NamedElementHandler::addEdge_namespace
}

function addEdge_ownedMember(_namespace: GraphNode) {
  // ♦ /ownedMember : NamedElement [0..*]{union, subsets Namespace::member, subsets Element::ownedElement} (opposite NamedElement::namespace)
  // A collection of NamedElements owned by the Namespace.

  // Added by NamedElementHandler::addEdge_namespace
}

function addEdge_ownedRule(namespace: GraphNode, ownedRules: GraphNode[]) {
  // ♦ ownedRule : Constraint [0..*]{subsets Namespace::ownedMember} (opposite Constraint::context)
  // Specifies a set of Constraints owned by this Namespace.
  ownedRules.forEach((ownedRule) => {
    namespace.model.addEdge('ownedRule', namespace, ownedRule)
  })
}

function addEdge_packageImport(namespace: GraphNode, packageImports: GraphNode[]) {
  // ♦ packageImport : PackageImport [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite PackageImport::importingNamespace)
  // References the PackageImports owned by the Namespace.
  packageImports.forEach((packageImport) => {
    namespace.model.addEdge('packageImport', namespace, packageImport)
  })
}
