import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'

import { Archimate } from './metamodel/archimate'
import { inferArchimateHandler } from './metamodel/archimate-handler-registry'
import { validateArchimateModel } from './metamodel/archimate-validations'

const refine = createRefiner(Archimate, inferArchimateHandler)

export const ArchimateRefiner = definePlugin({
  name: 'archimate',
  parameters: {
    relationshipsAsNodes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Treat relationships as nodes',
    },
    viewsAsNodes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Include views and link their respective elements',
    },
  },
  invoke: (input: GraphModel, parameters) => {
    removeUnsupportedNodes(input, parameters.viewsAsNodes)
    if (input.root.tag === 'archimate:model') {
      const model = refine(input, parameters)
      validateArchimateModel(model, parameters)
      return model
    } else if (input.root.tag === 'model') {
      throw new Error('Invalid format! Please choose a different ArchiMate parser.')
    } else {
      throw new Error('Invalid ArchiMate file format!')
    }
  },
})

function removeUnsupportedNodes(model: GraphModel, viewsAsNodes: boolean) {
  if (!viewsAsNodes) {
    model.nodes.forEach((node: GraphNode) => {
      if (isViewFolder(node)) {
        model.removeNode(node)
      }
    })
  }
}

function isViewFolder(node: GraphNode): boolean {
  return (node.tag === 'folder' && node.getAttribute('name')?.value.literal === 'Views')
}

/*
function isArchiFormat(input: GraphModel) {
  const xmlnsArchimate = input.root.getAttribute('xmlns:archimate');
  console.log(xmlnsArchimate)
  if (input.root.tag === 'archimate:model') {
    return true
  }
  return false
}
*/

function handleTextNode(node: GraphNode, textContent: string) {
  const tag = node.tag
  if (!['purpose', 'documentation'].includes(tag)) {
    return
  }
  node.addAttribute({ name: 'text', type: 'string', value: { literal: textContent } })
}

export const ArchimateParser = compose(
  createXmiParser(Archimate.Attributes.id, handleTextNode),
  ArchimateRefiner,
  // compose(ArchimateRefiner, IrPostProcessor),
  'archimate',
)
