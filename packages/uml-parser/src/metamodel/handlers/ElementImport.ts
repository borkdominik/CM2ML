import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import {
  ElementImport,
  Namespace,
  requireImmediateParentOfType,
} from '../metamodel'

export const ElementImportHandler = ElementImport.createHandler(
  (elementImport) => {
    addEdge_importedElement(elementImport)
    addEdge_importingNamespace(elementImport)
  },
)

function addEdge_importedElement(elementImport: GraphNode) {
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
  elementImport.model.addEdge('importedElement', elementImport, importedElement)
}

function addEdge_importingNamespace(elementImport: GraphNode) {
  const importingNamespace = requireImmediateParentOfType(
    elementImport,
    Namespace,
  )
  elementImport.model.addEdge(
    'importingNamespace',
    elementImport,
    importingNamespace,
  )
}
