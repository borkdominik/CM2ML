import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import {
  ElementImport,
  NamedElement,
  Namespace,
  PackageImport,
} from '../metamodel'

export const NamespaceHandler = Namespace.createHandler(
  (namespace, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    namespace.children.forEach((child) => {
      addEdge_elementImport(namespace, child)
      addEdge_importedMember(namespace, child)
      addEdge_member(namespace, child)
      addEdge_ownedMember(namespace, child)
      addEdge_ownedRule(namespace, child)
      addEdge_packageImport(namespace, child)
    })
  },
)

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
  if (PackageImport.isAssignable(child)) {
    const importedPackageId = child.getAttribute(Uml.Attributes.importedPackage)
      ?.value.literal
    if (!importedPackageId) {
      throw new Error('Missing importedPackage attribute on PackageImport')
    }
    const importedPackage = child.model.getNodeById(importedPackageId)
    if (!importedPackage) {
      throw new Error(
        `Missing importedPackage with id ${importedPackageId} for PackageImport`,
      )
    }
    namespace.model.addEdge('member', namespace, importedPackage)
  }
  if (ElementImport.isAssignable(child)) {
    const importedElementId = child.getAttribute(Uml.Attributes.importedElement)
      ?.value.literal
    if (!importedElementId) {
      throw new Error('Missing importedElement attribute on ElementImport')
    }
    const importedElement = child.model.getNodeById(importedElementId)
    if (!importedElement) {
      throw new Error(
        `Missing importedElement with id ${importedElementId} for ElementImport`,
      )
    }
    namespace.model.addEdge('member', namespace, importedElement)
  }
}

function addEdge_ownedMember(namespace: GraphNode, child: GraphNode) {
  if (NamedElement.isAssignable(child)) {
    namespace.model.addEdge('ownedMember', namespace, child)
  }
}

function addEdge_ownedRule(_namespace: GraphNode, _child: GraphNode) {
  // TODO
  // ♦ ownedRule : Constraint [0..*]{subsets Namespace::ownedMember} (opposite Constraint::context)
  // Specifies a set of Constraints owned by this Namespace.
}

function addEdge_packageImport(namespace: GraphNode, child: GraphNode) {
  if (PackageImport.isAssignable(child)) {
    namespace.model.addEdge('packageImport', namespace, child)
  }
}
