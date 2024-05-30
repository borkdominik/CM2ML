import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'

import { Archimate } from './metamodel/archimate'
import { inferArchimateHandler } from './metamodel/archimate-handler-registry'
import { validateArchimateModel } from './metamodel/archimate-validations'
import { isArchiFormat, restructureArchiXml } from './formats/archi-format'
import { isOpenGroupFormat, restructureOpenGroupXml } from './formats/opengroup-format'

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
    preprocess(input);
    const model = refine(input, parameters)
    validateArchimateModel(model, parameters)
    return model
  },
})

function preprocess(input: GraphModel) {
  if (isArchiFormat(input)) {
    restructureArchiXml(input)
  } else if (isOpenGroupFormat(input)) {
    restructureOpenGroupXml(input)
  } else {
    throw new Error('Unknown ArchiMate format!')
  }
}

function removeUnsupportedNodes(input: GraphModel, viewsAsNodes: boolean) {
  input.nodes.forEach((node) => {
    if (!viewsAsNodes && isViewElement(node)) {
      input.removeNode(node)
    } else if (node.tag === 'bounds' || node.tag === 'style') {
      input.removeNode(node)
    }
  })
}

function isViewElement(node: GraphNode): boolean {
  // Views are stored within a <views> tag in opengroup format
  return (node.tag === 'views') ||
    // or as multiple <element> tags in archi format
    (node.tag === 'element' && node.getAttribute('xsi:type')?.value.literal === 'ArchimateDiagramModel')
}

function handleTextNode(node: GraphNode, textContent: string) {
  const tag = node.tag
  if (!['purpose', 'documentation', 'name'].includes(tag)) {
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
