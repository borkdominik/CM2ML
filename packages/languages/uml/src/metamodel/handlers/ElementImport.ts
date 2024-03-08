import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
} from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { ElementImport, Namespace, PackageableElement } from '../uml-metamodel'

export const ElementImportHandler = ElementImport.createHandler(
  (elementImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = getParentOfType(elementImport, Namespace)
    const importedElement = resolve(elementImport, 'importedElement', { type: PackageableElement })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(elementImport, importingNamespace, importedElement)
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
  // importedElement : PackageableElement [1..1]{subsets DirectedRelationship::target} (opposite A_importedElement_import::import)
  // Specifies the PackageableElement whose name is to be added to a Namespace.
  if (!importedElement) {
    return
  }
  elementImport.model.addEdge('importedElement', elementImport, importedElement)
  elementImport.model.addEdge('target', elementImport, importedElement)
  elementImport.model.addEdge('relatedElement', elementImport, importedElement)
}

function addEdge_importingNamespace(elementImport: GraphNode, importingNamespace: GraphNode | undefined) {
  // importingNamespace : Namespace [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Namespace::elementImport)
  // Specifies the Namespace that imports a PackageableElement from another Namespace.
  if (!importingNamespace) {
    return
  }
  elementImport.model.addEdge(
    'importingNamespace',
    elementImport,
    importingNamespace,
  )
  elementImport.model.addEdge('source', elementImport, importingNamespace)
  elementImport.model.addEdge('relatedElement', elementImport, importingNamespace)
}
