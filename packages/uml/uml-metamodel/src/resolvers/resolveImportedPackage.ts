import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'

export function resolveImportedPackage(packageImport: GraphNode) {
  const importedPackage =
    resolveImportedPackageFromAttribute(packageImport) ??
    resolveImportedPackageFromChild(packageImport)
  if (!importedPackage) {
    throw new Error(
      'Missing importedPackage attribute or child on PackageImport',
    )
  }
  return importedPackage
}

function resolveImportedPackageFromAttribute(packageImport: GraphNode) {
  const importedPackageId = packageImport.getAttribute(
    Uml.Attributes.importedPackage,
  )?.value.literal
  if (!importedPackageId) {
    return undefined
  }
  const importedPackage = packageImport.model.getNodeById(importedPackageId)
  if (!importedPackage) {
    throw new Error(
      `Missing importedPackage with id ${importedPackageId} for PackageImport`,
    )
  }
  return importedPackage
}

function resolveImportedPackageFromChild(packageImport: GraphNode) {
  return Stream.from(packageImport.children).find(
    (child) => child.tag === 'importedPackage',
  )
}
