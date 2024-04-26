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
  parameters: {},
  invoke: (input: GraphModel, _parameters) => {
    removeUnsupportedNodes(input)
    if (input.root.tag === 'archimate:model') {
      const handlerParameters = {}
      const model = refine(input, handlerParameters)
      validateArchimateModel(model, handlerParameters)
      return model
    } else if (input.root.tag === 'model') {
      return input
    } else {
      throw new Error('Invalid ArchiMate file format!')
    }
  },
})

function removeUnsupportedNodes(model: GraphModel) {
  model.nodes.forEach((node: GraphNode) => {
    if (isViewFolder(node)) {
      model.removeNode(node)
    }
  })
}

function isViewFolder(node: GraphNode): boolean {
  return (node.tag === 'folder' && node.getAttribute('name')?.value.literal === 'Views')
}

function handleTextNode(node: GraphNode, textContent: string) {
  const tag = node.tag
  if (!['purpose', 'documentation'].includes(tag)) {
    return
  }
  // TODO/Archimate: Define type
  node.addAttribute({ name: 'text', type: 'unknown', value: { literal: textContent } })
}

export const ArchimateParser = compose(
  createXmiParser(Archimate.Attributes.id, handleTextNode),
  ArchimateRefiner,
  // compose(ArchimateRefiner, IrPostProcessor),
  'archimate',
)
