import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
  transformNodeToEdge,
} from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Namespace, PackageImport } from '../uml-metamodel'

export const PackageImportHandler = PackageImport.createHandler(
  (packageImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = getParentOfType(packageImport, Namespace)
    const importedPackage = resolve(packageImport, 'importedPackage')
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

function addEdge_importedPackage(packageImport: GraphNode, importedPackage: GraphNode | undefined) {
  if (!importedPackage) {
    return
  }
  packageImport.model.addEdge('importedPackage', packageImport, importedPackage)
}

function addEdge_importingNamespace(packageImport: GraphNode, importingNamespace: GraphNode | undefined) {
  if (!importingNamespace) {
    return
  }
  packageImport.model.addEdge(
    'importingNamespace',
    packageImport,
    importingNamespace,
  )
}
