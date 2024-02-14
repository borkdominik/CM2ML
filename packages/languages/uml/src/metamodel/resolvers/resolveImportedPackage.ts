import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'
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
  const importedPackage = Stream.from(packageImport.children).find(
    (child) => child.tag === 'importedPackage',
  )
  if (importedPackage && !Uml.getType(importedPackage)) {
    importedPackage.addAttribute({ name: Uml.typeAttributeName, value: { literal: Uml.Types.Package } })
  }
  return importedPackage
}
