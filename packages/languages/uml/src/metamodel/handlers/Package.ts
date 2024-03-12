import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import {
  Package,
  PackageMerge,
  PackageableElement,
  ProfileApplication,
  Type,
} from '../uml-metamodel'

export const PackageHandler = Package.createHandler(
  (package_, { onlyContainmentAssociations }) => {
    const packagedElements = resolve(package_, 'packagedElement', { many: true, type: PackageableElement })
    const packageMerges = resolve(package_, 'packageMerge', { many: true, type: PackageMerge })
    const profileApplications = resolve(package_, 'profileApplication', { many: true, type: ProfileApplication })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_nestingPackage(package_)
    package_.children.forEach((child) => {
      addEdge_nestedPackage(package_, child)
      addEdge_ownedStereotype(package_, child)
      addEdge_ownedType(package_, child)
    })
    addEdge_packagedElement(package_, packagedElements)
    addEdge_packageMerge(package_, packageMerges)
    addEdge_profileApplication(package_, profileApplications)
  },
)

function addEdge_nestedPackage(package_: GraphNode, child: GraphNode) {
  // ♦ /nestedPackage : Package [0..*]{subsets Package::packagedElement} (opposite Package::nestingPackage)
  if (Package.isAssignable(child)) {
    package_.model.addEdge('nestedPackage', package_, child)
    child.model.addEdge('nestingPackage', child, package_)
  }
}

function addEdge_nestingPackage(_package_: GraphNode) {
  // nestingPackage : Package [0..1]{subsets A_packagedElement_owningPackage::owningPackage} (opposite Package::nestedPackage)

  // Added by addEdge_nestedPackage
}

function addEdge_ownedStereotype(_package_: GraphNode, _child: GraphNode) {
  // TODO/Association
  // ♦ /ownedStereotype : Stereotype [0..*]{subsets Package::packagedElement} (opposite A_ownedStereotype_owningPackage::owningPackage)
  // References the Stereotypes that are owned by the package.
}

function addEdge_ownedType(package_: GraphNode, child: GraphNode) {
  if (Type.isAssignable(child)) {
    package_.model.addEdge('ownedType', package_, child)
  }
}

function addEdge_packageMerge(package_: GraphNode, packageMerges: GraphNode[]) {
  // ♦ packageMerge : PackageMerge [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite PackageMerge::receivingPackage)
  // References the PackageMerges that are owned by this Package.
  packageMerges.forEach((packageMerge) => {
    package_.model.addEdge('packageMerge', package_, packageMerge)
  })
}

function addEdge_packagedElement(package_: GraphNode, packagedElements: GraphNode[]) {
  // ♦ packagedElement : PackageableElement [0..*]{subsets Namespace::ownedMember} (opposite A_packagedElement_owningPackage::owningPackage)
  // Specifies the packageable elements that are owned by this Package.
  packagedElements.forEach((packagedElement) => {
    package_.model.addEdge('packagedElement', package_, packagedElement)
  })
}

function addEdge_profileApplication(package_: GraphNode, profileApplications: GraphNode[]) {
  // ♦ profileApplication : ProfileApplication [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite ProfileApplication::applyingPackage)
  // References the ProfileApplications that indicate which profiles have been applied to the Package.
  profileApplications.forEach((profileApplication) => {
    package_.model.addEdge('profileApplication', package_, profileApplication)
  })
}
