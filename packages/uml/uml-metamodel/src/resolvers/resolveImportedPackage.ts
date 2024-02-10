import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Package } from '../uml-metamodel'

import { resolveFromAttribute } from './fromAttribute'

export function resolveImportedPackage(packageImport: GraphNode) {
  const importedPackage =
    resolveFromAttribute(packageImport, 'importedPackage', { type: Package }) ??
    resolveImportedPackageFromChild(packageImport)
  if (!importedPackage) {
    throw new Error(
      'Missing importedPackage attribute or child on PackageImport',
    )
  }
  return importedPackage
}

function resolveImportedPackageFromChild(packageImport: GraphNode) {
  return Stream.from(packageImport.children).find(
    (child) => child.tag === 'importedPackage',
  )
}
