import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
} from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { Namespace, Package, PackageImport } from '../uml-metamodel'

export const PackageImportHandler = PackageImport.createHandler(
  (packageImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = getParentOfType(packageImport, Namespace)
    const importedPackage = resolve(packageImport, 'importedPackage', { type: Package })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(packageImport, importingNamespace, importedPackage)
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

function addEdge_importedPackage(packageImport: GraphNode, importedPackage: GraphNode | undefined) {
  // importedPackage : Package [1..1]{subsets DirectedRelationship::target} (opposite A_importedPackage_packageImport::packageImport)
  if (!importedPackage) {
    return
  }
  packageImport.model.addEdge('importedPackage', packageImport, importedPackage)
}

function addEdge_importingNamespace(packageImport: GraphNode, importingNamespace: GraphNode | undefined) {
  // importingNamespace : Namespace [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Namespace::packageImport)
  if (!importingNamespace) {
    return
  }
  packageImport.model.addEdge(
    'importingNamespace',
    packageImport,
    importingNamespace,
  )
}
