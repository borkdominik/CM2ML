import type { GraphNode } from '@cm2ml/ir'

import {
  Package,
  PackageMerge,
  PackageableElement,
  Type,
  getParentOfType,
} from '../metamodel'

export const PackageHandler = Package.createHandler((node) => {
  addEdge_nestingPackage(node)
  node.children.forEach((child) => {
    addEdge_nestedPackage(node, child)
    addEdge_ownedStereotype(node, child)
    addEdge_ownedType(node, child)
    addEdge_packageMerge(node, child)
    addEdge_packagedElement(node, child)
    addEdge_profileApplication(node, child)
  })
})

function addEdge_nestedPackage(package_: GraphNode, child: GraphNode) {
  if (Package.isAssignable(child)) {
    package_.model.addEdge('nestedPackage', package_, child)
  }
}

function addEdge_nestingPackage(package_: GraphNode) {
  const nestingPackage = getParentOfType(package_, Package)
  if (!nestingPackage) {
    return
  }
  package_.model.addEdge('nestingPackage', package_, nestingPackage)
}

function addEdge_ownedStereotype(_package_: GraphNode, _child: GraphNode) {
  // TODO
  // ♦ /ownedStereotype : Stereotype [0..*]{subsets Package::packagedElement} (opposite A_ownedStereotype_owningPackage::owningPackage)
  // References the Stereotypes that are owned by the package_.
}

function addEdge_ownedType(package_: GraphNode, child: GraphNode) {
  if (Type.isAssignable(child)) {
    package_.model.addEdge('ownedType', package_, child)
  }
}

function addEdge_packageMerge(package_: GraphNode, child: GraphNode) {
  if (PackageMerge.isAssignable(child)) {
    package_.model.addEdge('packageMerge', package_, child)
  }
}

function addEdge_packagedElement(package_: GraphNode, child: GraphNode) {
  if (PackageableElement.isAssignable(child)) {
    package_.model.addEdge('packagedElement', package_, child)
  }
}

function addEdge_profileApplication(_package_: GraphNode, _child: GraphNode) {
  // TODO
  // ♦ profileApplication : ProfileApplication [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite ProfileApplication::applyingPackage)
  // References the ProfileApplications that indicate which profiles have been applied to the Package.
}
