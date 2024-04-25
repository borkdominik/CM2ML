import type { GraphNode } from '@cm2ml/ir'

import { Folder } from '../archimate-metamodel'

const layerFolders = new Set([
  'Strategy',
  'Business',
  'Application',
  'Technology & Physical',
  'Motivation',
  'Implementation & Migration',
  'Other',
])
const relationFolder = 'Relations'

export const FolderHandler = Folder.createHandler(
  (folder) => {
    const folderName = folder.getAttribute('name')?.value.literal
    if (!folderName) {
      throw new Error(`Missing name for folder '${folder.id}'`)
    } else if (layerFolders.has(folderName)) {
      processElements(folder, folderName)
    } else if (folderName === relationFolder) {
      processRelations(folder)
    } else {
      throw new Error(`Unsupported folder name '${folderName}'`)
    }
  },
)

function processElements(folder: GraphNode, folderName: string) {
  folder.children.forEach((elementNode) => {
    // TODO: Define type
    elementNode.addAttribute({ name: 'layer', type: 'unknown', value: { literal: folderName } }, false)
    folder.removeChild(elementNode)
    folder.model.root.addChild(elementNode)
  })
  folder.model.removeNode(folder)
}

function processRelations(folder: GraphNode) {
  folder.children.forEach((relationNode) => {
    const sourceId = relationNode.getAttribute('source')?.value.literal
    const targetId = relationNode.getAttribute('target')?.value.literal
    if (!sourceId || !targetId) {
      console.error(`Missing source/target attribute in relation '${relationNode.id}'`)
      return
    }
    const sourceNode = folder.model.getNodeById(sourceId)
    const targetNode = folder.model.getNodeById(targetId)
    if (!sourceNode || !targetNode) {
      console.error(`Could not find source/target node of relation '${relationNode.id}'`)
      return
    }
    const relationType = relationNode.getAttribute('xsi:type')?.value.literal
    if (!relationType) {
      console.error(`Missing xsi:type attribute in relation '${relationNode.id}'`)
      return
    }
    folder.model.addEdge(relationType, sourceNode, targetNode)
  })
  folder.model.removeNode(folder)
}
