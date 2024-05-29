import type { GraphNode } from '@cm2ml/ir'

import { Archimate } from '../archimate'
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
const viewFolder = 'Views'

/**
 * Folders are handled by extracting their elements and adding them to the root model,
 * while the containing folder element is deleted, for example:
 *
 * <model>
 *  <folder>                  <model>
 *    <element>                 <element>
 *    <element>      --\>       <element>
 *    <element>                 <element>
 *  </folder>                 </model>
 * </model>
 */
export const FolderHandler = Folder.createHandler(
  (folder, { relationshipsAsNodes }) => {
    const folderName = folder.getAttribute('name')?.value.literal
    if (!folderName) {
      throw new Error(`Missing name for folder '${folder.id}'`)
    } else if (layerFolders.has(folderName)) {
      processElements(folder, folderName)
    } else if (folderName === relationFolder) {
      processRelations(folder, relationshipsAsNodes)
    } else if (folderName === viewFolder) {
      processViews(folder)
    } else {
      throw new Error(`Unsupported folder name '${folderName}'`)
    }
  },
)

function processElements(folder: GraphNode, folderName: string) {
  folder.children.forEach((elementNode) => {
    elementNode.addAttribute({ name: Archimate.Attributes.layer, type: 'string', value: { literal: folderName } }, false)
    folder.removeChild(elementNode)
    folder.model.root.addChild(elementNode)
  })
  folder.model.removeNode(folder)
}

function processRelations(folder: GraphNode, relationshipsAsNodes: boolean) {
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

    if (relationshipsAsNodes) {
      folder.removeChild(relationNode)
      folder.model.root.addChild(relationNode)
      folder.model.addEdge('source', relationNode, sourceNode)
      folder.model.addEdge('target', relationNode, targetNode)
    } else {
      folder.model.addEdge(relationType, sourceNode, targetNode)
    }
  })
  folder.model.removeNode(folder)
}

function processViews(folder: GraphNode) {
  folder.children.forEach((view) => {
    folder.removeChild(view)
    folder.model.root.addChild(view)
  })
  folder.model.removeNode(folder)
}
