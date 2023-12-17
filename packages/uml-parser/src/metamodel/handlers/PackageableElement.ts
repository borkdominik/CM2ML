import { Package, PackageableElement } from '../metamodel'

export const PackageableElementHandler = PackageableElement.createHandler(
  (node) => {
    const parent = node.parent
    if (!parent) {
      return
    }
    if (!Package.isAssignable(parent)) {
      return
    }
    node.model.addEdge('owningPackage', node, parent)
  },
)
