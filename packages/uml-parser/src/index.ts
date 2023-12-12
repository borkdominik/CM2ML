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
  },
  invoke: (input: GraphModel, { strict }) => refine(input, strict),
})

export const UmlParser = compose(XmiParser, UmlRefiner, 'uml')

function refine(model: GraphModel, strict: boolean): GraphModel {
  narrowModelRefine(model)
  refineNode(model.root, strict)
  Stream.from(model.nodes).forEach((node) => {
    const type = Uml.getType(node)
    if (Uml.isValidType(type)) {
      node.tag = type
    } else if (strict) {
      throw new Error(`Unknown type: ${type}`)
    }
  })
  // console.log(
  //   Stream.from(model.edges)
  //     .map((edge) => `${edge.source.tag} --${edge.tag}-> ${edge.target.tag}`)
  //     .join('\n')
  //     .concat('\n'),
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

function narrowModelRefine(model: GraphModel) {
  const newRoot = findModelRoot(model.root)
  if (!newRoot) {
    return
  }
  const tagType = Uml.getTypeFromTag(newRoot)
  if (tagType !== undefined && newRoot.getAttribute('type') === undefined) {
    newRoot.addAttribute({
      name: 'type',
      value: { literal: tagType },
    })
  }
  model.root = newRoot
}

function refineNode(node: GraphNode, strict: boolean) {
  const refiner = getRefiner(node)
  if (!refiner) {
    if (strict) {
      throw new Error(
        `No refiner for node with tag ${node.tag} and type ${Uml.getType(
          node,
        )}`,
      )
    }
    return
  }
  refiner.refine(node)
  Stream.from(node.children).forEach((child) => refineNode(child, strict))
}
