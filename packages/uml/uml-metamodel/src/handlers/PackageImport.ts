import type { GraphNode } from '@cm2ml/ir'
import {
  requireImmediateParentOfType,
  transformNodeToEdge,
} from '@cm2ml/metamodel'

import { Uml } from '../uml'
import { Namespace, PackageImport } from '../uml-metamodel'

export const PackageImportHandler = PackageImport.createHandler(
  (packageImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    if (relationshipsAsEdges) {
      const importingNamespace = getImportingNamespace(packageImport)
      const importedPackage = getImportedPackage(packageImport)
      transformNodeToEdge(packageImport, importingNamespace, importedPackage)
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

function getImportedPackage(packageImport: GraphNode) {
  const importedPackageId = packageImport.getAttribute(
    Uml.Attributes.importedPackage,
  )?.value.literal
  if (!importedPackageId) {
    throw new Error('Missing importedPackage attribute on PackageImport')
  }
  const importedPackage = packageImport.model.getNodeById(importedPackageId)
  if (!importedPackage) {
    throw new Error(
      `Missing importedPackage with id ${importedPackageId} for PackageImport`,
    )
  }
  return importedPackage
}

function getImportingNamespace(packageImport: GraphNode) {
  return requireImmediateParentOfType(packageImport, Namespace)
}

function addEdge_importedPackage(packageImport: GraphNode) {
  const importedPackage = getImportedPackage(packageImport)
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
