import type { GraphNode } from '@cm2ml/ir'
import {
  getParentOfType,
} from '@cm2ml/metamodel'
import { Stream } from '@yeger/streams'

import { addEdge_relatedElement } from '../resolvers/relatedElement'
import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { ElementImport, Namespace, PackageableElement } from '../uml-metamodel'

export const ElementImportHandler = ElementImport.createHandler(
  (elementImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const importingNamespace = getParentOfType(elementImport, Namespace)
    const importedElement = resolve(elementImport, 'importedElement', { type: PackageableElement })
    if (!onlyContainmentAssociations) {
      addEdge_importedMember_member(importingNamespace, importedElement)
    }
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(elementImport, importingNamespace, importedElement)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_importedElement(elementImport, importedElement)
    addEdge_importingNamespace(elementImport, importingNamespace)
    addEdge_relatedElement(elementImport, importingNamespace, importedElement)
  },
  {
    [Uml.Attributes.alias]: { type: 'string' },
    [Uml.Attributes.visibility]: { type: 'category', defaultValue: 'public' },
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
}

function addEdge_importedMember_member(importingNamespace: GraphNode | undefined, importedElement: GraphNode | undefined) {
  if (!importingNamespace || !importedElement) {
    return
  }

  importingNamespace.model.addEdge('importedMember', importingNamespace, importedElement)
  if (Stream.from(importingNamespace.outgoingEdges).find((edge) => edge.tag === 'member' && edge.target === importedElement)) {
    // importedElement is already a member
    return
  }
  importingNamespace.model.addEdge('member', importingNamespace, importedElement)
}
