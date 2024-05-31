import type { GraphModel, GraphNode } from '@cm2ml/ir'

import { Archimate } from '../metamodel/archimate'

// Archi Storage Format (typically ending in *.archimate)
// https://www.archimatetool.com/
export function isArchiFormat(input: GraphModel) {
  return (
    input.root.tag === 'archimate:model' &&
    (
      input.root.getAttribute('xmlns:archimate')?.value.literal === 'http://www.archimatetool.com/archimate' ||
      input.root.getAttribute('xmlns:archimate')?.value.literal === 'http://www.bolton.ac.uk/archimate'
    )
  )
}

export function restructureArchiXml(input: GraphModel) {
  input.nodes.forEach((node) => {
    if (node.tag === 'folder') {
      handleFolderNode(node, input)
    } else if (node.tag === 'archimate:model' || node.tag === 'element') {
      handleChildDocumentationNode(node, input)
    }
  })
  // TODO: persistMetadata(input)
}

function handleFolderNode(node: GraphNode, input: GraphModel) {
  node.children.forEach((child) => {
    if (child.tag === 'element') {
      node.removeChild(child)
      input.root.addChild(child)
    } else if (child.tag === 'folder') {
      handleFolderNode(child, input)
    }
  })
  input.root.model.removeNode(node)
}

function handleChildDocumentationNode(node: GraphNode, input: GraphModel) {
  node.children.forEach((child) => {
    if (child.tag === 'documentation' || child.tag === 'purpose') {
      const text = child.getAttribute('text')?.value.literal
      if (text) {
        node.addAttribute({ name: Archimate.Attributes.documentation, type: 'string', value: { literal: text } })
      }
      input.removeNode(child)
    }
  })
}
