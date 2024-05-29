import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'

import { Archimate } from './metamodel/archimate'
import { inferArchimateHandler } from './metamodel/archimate-handler-registry'

// TODO: separate Metamodel?
const refine = createRefiner(Archimate, inferArchimateHandler)

export const ArchimateXmlRefiner = definePlugin({
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
    if (input.root.tag === 'archimate:model') {
      throw new Error('Invalid format! Please choose a different parser.')
    } else if (input.root.tag === 'model') {
      // TODO
      // preprocessModel(input)
      // const model = refine(input, parameters)
      // return model
      refine(input, parameters)
      throw new Error('Format currently not supported.')
    } else {
      throw new Error('Invalid ArchiMate file format!')
    }
  },
})

/*
function preprocessModel(model: GraphModel) {
  model.nodes.forEach((node: GraphNode) => {
        if (node.tag === 'metadata') {
            model.removeNode(node)
        }
        if (node.tag === 'name') {
            const text = node.getAttribute('text')?.value.literal
            if (text) {
                node.parent?.addAttribute({ name: 'name', value: { literal: text }})
            }
            model.removeNode(node)
        }
        if (node.tag === 'elements') {
            node.children.forEach((element) => {
                if (element.tag === 'element') {
                    node.removeChild(element)
                    model.root.addChild(element)
                }
            })
            model.removeNode(node)
        } else if (node.tag === 'relationships') {
            node.children.forEach((rel) => {
                if (rel.tag === 'relationship') {
                    node.removeChild(rel)
                    model.root.addChild(rel)
                }
            })
            model.removeNode(node)
        }
        if (node.tag === 'views') {
            model.removeNode(node)
        }
    })
}
*/

function handleTextNode(node: GraphNode, textContent: string) {
  const tag = node.tag
  if (!['name', 'documentation'].includes(tag)) {
    return
  }
  node.addAttribute({ name: 'text', type: 'string', value: { literal: textContent } })
}

export const ArchimateXmlParser = compose(
  createXmiParser('identifier', handleTextNode),
  ArchimateXmlRefiner,
  // compose(ArchimateRefiner, IrPostProcessor),
  'archimate-xml',
)
