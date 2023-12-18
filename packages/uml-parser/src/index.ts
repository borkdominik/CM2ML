import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { compose, definePlugin } from '@cm2ml/plugin'
import { XmiParser } from '@cm2ml/xmi-parser'
import { Stream } from '@yeger/streams'

import { inferHandler } from './metamodel/handler-registry'
import { Uml, inferAndSaveType } from './uml'

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
  removeNonUmlNodes(model)
  refineNodesRecursively(model.root, strict)
  replaceTagsWithTypes(model, strict)
  // TODO Remove log
  // eslint-disable-next-line no-console
  console.log(
    Stream.from(model.edges)
      .map((edge) => `${edge.source.tag} --${edge.tag}-> ${edge.target.tag}`)
      .join('\n')
      .concat('\n'),
  )
  return model
}

function findModelRoot(node: GraphNode): GraphNode | undefined {
  if (Uml.getType(node) !== undefined) {
    return node
  }
  const tagType = Uml.getTypeFromTag(node)
  if (tagType !== undefined) {
    inferAndSaveType(node, tagType)
    return node
  }
  return Stream.from(node.children)
    .map(findModelRoot)
    .find((child) => child !== undefined)
}

/** This function strips the model (root) of non-UML elements */
function removeNonUmlNodes(model: GraphModel) {
  const newRoot = findModelRoot(model.root)
  if (!newRoot) {
    return
  }
  model.root = newRoot
}

function refineNodesRecursively(node: GraphNode, strict: boolean) {
  const handler = inferHandler(node)
  if (!handler) {
    if (strict) {
      throw new Error(
        `No handler for node with tag ${node.tag} and type ${Uml.getRawType(
          node,
        )}`,
      )
    }
    return
  }
  handler.handle(node)
  Stream.from(node.children).forEach((child) =>
    refineNodesRecursively(child, strict),
  )
}

function replaceTagsWithTypes(model: GraphModel, strict: boolean) {
  Stream.from(model.nodes).forEach((node) => {
    const type = Uml.getRawType(node)
    if (Uml.isValidType(type)) {
      node.tag = type
      return
    }
    if (!strict) {
      return
    }
    const resolvedType = type ? model.getNodeById(type) : undefined
    if (!resolvedType) {
      throw new Error(`Unknown type: ${type}`)
    }
  })
}
