import type { GraphNode } from '@cm2ml/ir'
import {
  requireImmediateParentOfType,
  transformNodeToEdge,
} from '@cm2ml/metamodel'

import { resolveImportedPackage } from '../resolvers/resolveImportedPackage'
import { Uml } from '../uml'
import { Namespace, PackageImport } from '../uml-metamodel'

export const PackageImportHandler = PackageImport.createHandler(
  (packageImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = getImportingNamespace(packageImport)
    const importedPackage = resolveImportedPackage(packageImport)
    if (relationshipsAsEdges) {
      const edgeTag = Uml.getEdgeTagForRelationship(packageImport)
      transformNodeToEdge(
        packageImport,
        importingNamespace,
        importedPackage,
        edgeTag,
      )
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_importedPackage(packageImport, importedPackage)
    addEdge_importingNamespace(packageImport, importingNamespace)
  },
  {
    [Uml.Attributes.visibility]: 'public',
  },
)

function getImportingNamespace(packageImport: GraphNode) {
  return requireImmediateParentOfType(packageImport, Namespace)
}

function addEdge_importedPackage(packageImport: GraphNode, importedPackage: GraphNode) {
  packageImport.model.addEdge('importedPackage', packageImport, importedPackage)
}

function addEdge_importingNamespace(packageImport: GraphNode, importingNamespace: GraphNode) {
  packageImport.model.addEdge(
    'importingNamespace',
    packageImport,
    importingNamespace,
  )
}
