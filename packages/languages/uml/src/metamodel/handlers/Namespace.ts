import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import {
  ElementImport,
  NamedElement,
  Namespace,
  PackageImport,
} from '../uml-metamodel'

export const NamespaceHandler = Namespace.createHandler(
  (namespace, { onlyContainmentAssociations }) => {
    const ownedRules = getOwnedRules(namespace)
    if (onlyContainmentAssociations) {
      return
    }
    namespace.children.forEach((child) => {
      addEdge_elementImport(namespace, child)
      addEdge_importedMember(namespace, child)
      addEdge_member(namespace, child)
      addEdge_ownedMember(namespace, child)
      addEdge_packageImport(namespace, child)
    })
    addEdge_ownedRule(namespace, ownedRules)
  },
)

function getOwnedRules(namespace: GraphNode) {
  const ownedRules = namespace.findAllChildren((child) => child.tag === 'ownedRule')
  ownedRules.forEach((ownedRule) => {
    // TODO/Jan: Only as fallback
    ownedRule.addAttribute({ name: Uml.typeAttributeName, value: { literal: Uml.Types.Constraint } })
  })
  return ownedRules
}

function addEdge_elementImport(namespace: GraphNode, child: GraphNode) {
  if (ElementImport.isAssignable(child)) {
    namespace.model.addEdge('elementImport', namespace, child)
  }
}

function addEdge_importedMember(namespace: GraphNode, child: GraphNode) {
  if (ElementImport.isAssignable(child) || PackageImport.isAssignable(child)) {
    namespace.model.addEdge('importedMember', namespace, child)
  }
}

function addEdge_member(namespace: GraphNode, child: GraphNode) {
  if (NamedElement.isAssignable(child)) {
    namespace.model.addEdge('member', namespace, child)
  }
  // TODO/Jan Consider removal
  // if (PackageImport.isAssignable(child)) {
  //   const importedPackage = resolveImportedPackage(child)
  //   namespace.model.addEdge('member', namespace, importedPackage)
  // }
  // if (ElementImport.isAssignable(child)) {
  //   const importedElementId = child.getAttribute('importedElement')
  //     ?.value.literal
  //   if (!importedElementId) {
  //     throw new Error('Missing importedElement attribute on ElementImport')
  //   }
  //   const importedElement = child.model.getNodeById(importedElementId)
  //   if (!importedElement) {
  //     throw new Error(
  //       `Missing importedElement with id ${importedElementId} for ElementImport`,
  //     )
  //   }
  //   namespace.model.addEdge('member', namespace, importedElement)
  // }
}

function addEdge_ownedMember(namespace: GraphNode, child: GraphNode) {
  if (NamedElement.isAssignable(child)) {
    namespace.model.addEdge('ownedMember', namespace, child)
  }
}

function addEdge_ownedRule(namespace: GraphNode, ownedRules: GraphNode[]) {
  // TODO/Association
  // ♦ ownedRule : Constraint [0..*]{subsets Namespace::ownedMember} (opposite Constraint::context)
  // Specifies a set of Constraints owned by this Namespace.
  ownedRules.forEach((ownedRule) => {
    namespace.model.addEdge('ownedRule', namespace, ownedRule)
  })
}

function addEdge_packageImport(namespace: GraphNode, child: GraphNode) {
  if (PackageImport.isAssignable(child)) {
    namespace.model.addEdge('packageImport', namespace, child)
  }
}
