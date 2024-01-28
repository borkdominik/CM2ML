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
    if (relationshipsAsEdges) {
      const importingNamespace = getImportingNamespace(packageImport)
      const importedPackage = resolveImportedPackage(packageImport)
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
    addEdge_importedPackage(packageImport)
    addEdge_importingNamespace(packageImport)
  },
  {
    [Uml.Attributes.visibility]: 'public',
  },
)

function getImportingNamespace(packageImport: GraphNode) {
  return requireImmediateParentOfType(packageImport, Namespace)
}

function addEdge_importedPackage(packageImport: GraphNode) {
  const importedPackage = resolveImportedPackage(packageImport)
  packageImport.model.addEdge('importedPackage', packageImport, importedPackage)
}

function addEdge_importingNamespace(packageImport: GraphNode) {
  const importingNamespace = getImportingNamespace(packageImport)
  packageImport.model.addEdge(
    'importingNamespace',
    packageImport,
    importingNamespace,
  )
}
