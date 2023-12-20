import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { compose, definePlugin } from '@cm2ml/plugin'
import { XmiParser } from '@cm2ml/xmi-parser'
import { Stream } from '@yeger/streams'

import { inferHandler } from './metamodel/handler-registry'
import { Uml, inferAndSaveType } from './uml'
import { validateModel } from './validations'

export const UmlRefiner = definePlugin({
  name: 'uml',
  parameters: {},
  invoke: (input: GraphModel, _parameters) => refine(input),
})

export const UmlParser = compose(XmiParser, UmlRefiner, 'uml')

function refine(model: GraphModel): GraphModel {
  removeNonUmlNodes(model)
  refineNodesRecursively(model.root)
  replaceTagsWithTypes(model)
  validateModel(model)
  model.debug(
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
  const tagType = Uml.getTagType(node)
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

function refineNodesRecursively(node: GraphNode) {
  const handler = inferHandler(node)
  if (!handler) {
    if (node.model.settings.strict) {
      throw new Error(
        `No handler for node with tag ${
          node.tag
        } and type ${Uml.getTypeAttribute(node)}`,
      )
    }
    return
  }
  handler.handle(node)
  Stream.from(node.children).forEach((child) => refineNodesRecursively(child))
}

function replaceTagsWithTypes(model: GraphModel) {
  Stream.from(model.nodes).forEach((node) => {
    const type = Uml.getTypeAttribute(node)
    if (Uml.isValidType(type)) {
      node.tag = type
      return
    }
    if (!model.settings.strict) {
      return
    }
    const resolvedType = type ? model.getNodeById(type) : undefined
    if (!resolvedType) {
      throw new Error(`Unknown type: ${type}`)
    }
  })
}
