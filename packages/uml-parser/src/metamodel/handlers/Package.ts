import { Uml } from '../../uml'
import { Package, PackageableElement } from '../metamodel'

export const PackageHandler = Package.createHandler((node) => {
  node.children.forEach((child) => {
    if (Package.isAssignable(child)) {
      node.model.addEdge('nestedPackage', node, child)
    }
    if (PackageableElement.isAssignable(child)) {
      node.model.addEdge(Uml.Tags.packagedElement, node, child)
    }
    // TODO
    // if (Model.isType(child)) {
    //   node.model.addEdge('ownedType', node, child)
    // }
  })
})
