import type { GraphNode } from '@cm2ml/ir'
import {
  requireImmediateParentOfType,
  transformNodeToEdge,
} from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ElementImport, Namespace, PackageableElement } from '../uml-metamodel'

export const ElementImportHandler = ElementImport.createHandler(
  (elementImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = getImportingNamespace(elementImport)
    const importedElement = resolve(elementImport, 'importedElement', { type: PackageableElement })
    if (relationshipsAsEdges) {
      const edgeTag = Uml.getEdgeTagForRelationship(elementImport)
      transformNodeToEdge(
        elementImport,
        importingNamespace,
        importedElement,
        edgeTag,
      )
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_importedElement(elementImport, importedElement)
    addEdge_importingNamespace(elementImport, importingNamespace)
  },
  {
    [Uml.Attributes.visibility]: 'public',
  },
)

function getImportingNamespace(elementImport: GraphNode) {
  return requireImmediateParentOfType(elementImport, Namespace)
}

function addEdge_importedElement(elementImport: GraphNode, importedElement: GraphNode | undefined) {
  if (!importedElement) {
    return
  }
  elementImport.model.addEdge('importedElement', elementImport, importedElement)
}

function addEdge_importingNamespace(elementImport: GraphNode, importingNamespace: GraphNode) {
  elementImport.model.addEdge(
    'importingNamespace',
    elementImport,
    importingNamespace,
  )
}
