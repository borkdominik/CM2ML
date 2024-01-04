import type { GraphNode } from '@cm2ml/ir'

import { Uml, transformNodeToEdge } from '../../uml'
import {
  ElementImport,
  Namespace,
  requireImmediateParentOfType,
} from '../metamodel'

export const ElementImportHandler = ElementImport.createHandler(
  (elementImport, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    if (relationshipsAsEdges) {
      const importingNamespace = getImportingNamespace(elementImport)
      const importedElement = getImportedElement(elementImport)
      transformNodeToEdge(elementImport, importingNamespace, importedElement)
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_importedElement(elementImport)
    addEdge_importingNamespace(elementImport)
  },
)

function getImportedElement(elementImport: GraphNode) {
  const importedElementId = elementImport.getAttribute(
    Uml.Attributes.importedElement,
  )?.value.literal
  if (!importedElementId) {
    throw new Error('Missing importedElement attribute on ElementImport')
  }
  const importedElement = elementImport.model.getNodeById(importedElementId)
  if (!importedElement) {
    throw new Error(
      `Missing importedElement with id ${importedElementId} for ElementImport`,
    )
  }
  return importedElement
}

function getImportingNamespace(elementImport: GraphNode) {
  return requireImmediateParentOfType(elementImport, Namespace)
}

function addEdge_importedElement(elementImport: GraphNode) {
  const importedElement = getImportedElement(elementImport)
  elementImport.model.addEdge('importedElement', elementImport, importedElement)
}

function addEdge_importingNamespace(elementImport: GraphNode) {
  const importingNamespace = getImportingNamespace(elementImport)
  elementImport.model.addEdge(
    'importingNamespace',
    elementImport,
    importingNamespace,
  )
}
