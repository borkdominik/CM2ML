import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { compose, definePlugin } from '@cm2ml/plugin'
import { XmiParser } from '@cm2ml/xmi-parser'
import { Stream } from '@yeger/streams'

import { getRefiner } from './refiners'
import { Uml } from './uml'

export const UmlRefiner = definePlugin({
  name: 'uml',
  parameters: {
    strict: {
      type: 'boolean',
      defaultValue: false,
      description:
        'Whether to fail when encountering unknown tags. Ignored if greedyEdges is true.',
    },
    greedyEdges: {
      type: 'boolean',
      defaultValue: false,
      description:
        'Whether to create edges for all attributes that match node ids.',
    },
  },
  invoke: (input: GraphModel, { greedyEdges, strict }) =>
    refine(input, strict, greedyEdges),
})

export const UmlParser = compose(XmiParser, UmlRefiner, 'uml')

function refine(
  model: GraphModel,
  strict: boolean,
  greedyEdges: boolean,
): GraphModel {
  refineModelRoot(model)
  Stream.from(model.nodes).forEach((node) =>
    createEdges(node, strict, greedyEdges),
  )
  Stream.from(model.nodes).forEach((node) => {
    const type = Uml.getUmlType(node)
    if (Uml.isValidType(type)) {
      node.tag = type
    } else if (strict) {
      throw new Error(`Unknown type: ${type}`)
    }
  })
  // console.log(
  //   Stream.from(model.edges)
  //     .map((edge) => `${edge.source.tag} --${edge.tag}-> ${edge.target.tag}`)
  //     .join('\n'),
  // )
  return model
}

function findModelRoot(node: GraphNode): GraphNode | undefined {
  if (Uml.getTypeFromTag(node) !== undefined) {
    return node
  }
  return Stream.from(node.children)
    .map(findModelRoot)
    .find((child) => child !== undefined)
}

function refineModelRoot(model: GraphModel) {
  const newRoot = findModelRoot(model.root)
  if (newRoot) {
    model.root = newRoot
  }
}

function createEdges(node: GraphNode, strict: boolean, greedyEdges: boolean) {
  if (greedyEdges) {
    createGreedyEdges(node)
    return
  }
  const refiner = getRefiner(node)
  if (!refiner) {
    if (strict) {
      throw new Error(`No refiner for tag: ${node.tag}`)
    }
    return
  }
  refiner(node)
}

function createGreedyEdges(node: GraphNode) {
  Stream.from(node.attributes)
    .filter(([, { name }]) => name !== node.model.idAttribute)
    .forEach(([_name, attribute]) => {
      const source = node.getNearestIdentifiableNode()
      if (!source) {
        return
      }
      const attributeValue = attribute.value.literal
      const target = node.model.getNodeById(attributeValue)
      if (!target) {
        return
      }
      const tag = attribute.name === 'idref' ? node.tag : attribute.name
      node.model.addEdge(tag, source, target)
    })
}
