import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
  transformNodeToEdge,
} from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ElementImport, Namespace, PackageableElement } from '../uml-metamodel'

export const ElementImportHandler = ElementImport.createHandler(
  (elementImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = getParentOfType(elementImport, Namespace)
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

function addEdge_importedElement(elementImport: GraphNode, importedElement: GraphNode | undefined) {
  if (!importedElement) {
    return
  }
  elementImport.model.addEdge('importedElement', elementImport, importedElement)
}

function addEdge_importingNamespace(elementImport: GraphNode, importingNamespace: GraphNode | undefined) {
  if (!importingNamespace) {
    return
  }
  elementImport.model.addEdge(
    'importingNamespace',
    elementImport,
    importingNamespace,
  )
}
