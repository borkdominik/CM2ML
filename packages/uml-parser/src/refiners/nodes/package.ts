import type { Attributable, GraphNode } from '@cm2ml/ir'

import { Model, Uml } from '../../uml'

import { PackageableElement } from './packageableElement'

export class Package extends PackageableElement {
  public isApplicable(node: GraphNode) {
    return node.tag === Uml.Types.Package || super.isApplicable(node)
  }

  public refine(node: GraphNode) {
    super.refine(node)
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
  const elementImportEdge = node.model.addEdge(
    Uml.Tags.elementImport,
    node,
    importedElement,
  )
  copyAttributes(elementImport, elementImportEdge)
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
  const packageImportEdge = node.model.addEdge(
    Uml.Tags.packageImport,
    node,
    importedPackage,
  )
  copyAttributes(packageImport, packageImportEdge)
  node.model.removeNode(packageImport)
}

function addPackageMerge(node: GraphNode, packageMerge: GraphNode) {
  const mergedPackageId = packageMerge.getAttribute(
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
  const packageMergeEdge = node.model.addEdge(
    Uml.Tags.packageMerge,
    node,
    mergedPackage,
  )
  copyAttributes(packageMerge, packageMergeEdge)
  node.model.removeNode(packageMerge)
}

function copyAttributes(source: Attributable, target: Attributable) {
  source.attributes.forEach((attribute) => {
    target.addAttribute(attribute)
  })
}
