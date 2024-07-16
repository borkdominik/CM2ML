import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
} from '@cm2ml/metamodel'

import { addEdge_relatedElement } from '../resolvers/relatedElement'
import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { Namespace, Package, PackageImport } from '../uml-metamodel'

export const PackageImportHandler = PackageImport.createHandler(
  (packageImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = resolve(packageImport, 'importingNamespace', { type: Namespace }) ?? getParentOfType(packageImport, Namespace)
    const importedPackage = resolve(packageImport, 'importedPackage', { type: Package })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(packageImport, importingNamespace, importedPackage)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_importedPackage(packageImport, importedPackage)
    addEdge_importingNamespace(packageImport, importingNamespace)
    addEdge_relatedElement(packageImport, importingNamespace, importedPackage)
  },
  {
    [Uml.Attributes.visibility]: { type: 'category', defaultValue: 'public' },
  },
)

function addEdge_importedPackage(packageImport: GraphNode, importedPackage: GraphNode | undefined) {
  // importedPackage : Package [1..1]{subsets DirectedRelationship::target} (opposite A_importedPackage_packageImport::packageImport)
  // Specifies the Package whose members are imported into a Namespace.
  if (!importedPackage) {
    return
  }
  packageImport.model.addEdge('importedPackage', packageImport, importedPackage)
  packageImport.model.addEdge('target', packageImport, importedPackage)
}

function addEdge_importingNamespace(packageImport: GraphNode, importingNamespace: GraphNode | undefined) {
  // importingNamespace : Namespace [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Namespace::packageImport)
  // Specifies the Namespace that imports the members from a Package.
  if (!importingNamespace) {
    return
  }
  packageImport.model.addEdge(
    'importingNamespace',
    packageImport,
    importingNamespace,
  )
  packageImport.model.addEdge('source', packageImport, importingNamespace)
}
