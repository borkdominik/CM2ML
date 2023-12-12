import type { GraphNode } from '@cm2ml/ir'

import { Model, Uml } from '../../uml'

import { refinePackagedElement } from './packagedElement'

export function refinePackage(node: GraphNode) {
  refinePackagedElement(node)
  node.children.forEach((child) => {
    if (Model.isElementImport(child)) {
      addElementImport(node, child)
    }
    if (Model.isPackage(child)) {
      node.model.addEdge('nestedPackage', node, child)
    }
    if (Model.isPackagedElement(child)) {
      node.model.addEdge(Uml.Tags.packagedElement, node, child)
    }
    if (Model.isPackageImport(child)) {
      addPackageImport(node, child)
    }
    if (Model.isPackageMerge(child)) {
      addPackageMerge(node, child)
    }
    if (Model.isType(child)) {
      node.model.addEdge('ownedType', node, child)
    }
  })
}

function addElementImport(node: GraphNode, elementImport: GraphNode) {
  const importedElementId = elementImport.getAttribute(
    Uml.Attributes.importedElement,
  )?.value.literal
  if (!importedElementId) {
    throw new Error('Missing importedElement attribute on elementImport')
  }
  const importedElement = node.model.getNodeById(importedElementId)
  if (!importedElement) {
    throw new Error(
      `Could not find node with id ${importedElementId} for elementImport`,
    )
  }
  node.model.addEdge(Uml.Tags.elementImport, node, importedElement)
  node.model.removeNode(elementImport)
}

function addPackageImport(node: GraphNode, packageImport: GraphNode) {
  const importedPackageId = packageImport.getAttribute(
    Uml.Attributes.importedPackage,
  )?.value.literal
  if (!importedPackageId) {
    throw new Error('Missing importedPackage attribute on packageImport')
  }
  const importedPackage = node.model.getNodeById(importedPackageId)
  if (!importedPackage) {
    throw new Error(
      `Could not find node with id ${importedPackageId} for packageImport`,
    )
  }
  node.model.addEdge(Uml.Tags.packageImport, node, importedPackage)
  node.model.removeNode(packageImport)
}

function addPackageMerge(node: GraphNode, packageImport: GraphNode) {
  const mergedPackageId = packageImport.getAttribute(
    Uml.Attributes.mergedPackage,
  )?.value.literal
  if (!mergedPackageId) {
    throw new Error('Missing mergedPackage attribute on packageMerge')
  }
  const mergedPackage = node.model.getNodeById(mergedPackageId)
  if (!mergedPackage) {
    throw new Error(
      `Could not find node with id ${mergedPackageId} for packageMerge`,
    )
  }
  node.model.addEdge(Uml.Tags.packageMerge, node, mergedPackage)
  node.model.removeNode(packageImport)
}
