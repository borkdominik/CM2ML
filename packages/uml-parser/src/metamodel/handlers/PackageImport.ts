import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import {
  Namespace,
  PackageImport,
  requireImmediateParentOfType,
} from '../metamodel'

export const PackageImportHandler = PackageImport.createHandler(
  (packageImport) => {
    addEdge_importedPackage(packageImport)
    addEdge_importingNamespace(packageImport)
  },
)

function addEdge_importedPackage(packageImport: GraphNode) {
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
  packageImport.model.addEdge('importedPackage', packageImport, importedPackage)
}

function addEdge_importingNamespace(packageImport: GraphNode) {
  const importingNamespace = requireImmediateParentOfType(
    packageImport,
    Namespace,
  )
  packageImport.model.addEdge(
    'importingNamespace',
    packageImport,
    importingNamespace,
  )
}
