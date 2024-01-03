import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { compose, definePlugin } from '@cm2ml/plugin'
import { getMessage } from '@cm2ml/utils'
import { XmiParser } from '@cm2ml/xmi-parser'
import { Stream } from '@yeger/streams'

import { inferHandler } from './metamodel/handler-registry'
import type { HandlerConfiguration } from './metamodel/metamodel'
import { Uml, inferAndSaveType } from './uml'
import { validateModel } from './validations'

// TODO: Transform the following Relationships into edges if relationshipsAsEdges is true
// - Abstraction
// - InformationFlow
// - Manifestation
// - Realization
// - Refine
// - TemplateBinding
// - Trace
// - Usage

// These are based on Papyrus UML
// The following Relationships are already being transformed
// - Dependency
// - ElementImport
// - PackageImport
// - PackageMerge

export const UmlRefiner = definePlugin({
  name: 'uml',
  parameters: {
    relationshipsAsEdges: {
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to treat relationships as edges.',
    },
  },
  invoke: (input: GraphModel, { relationshipsAsEdges }) =>
    refine(input, relationshipsAsEdges),
})

export const UmlParser = compose(XmiParser, UmlRefiner, 'uml')

function refine(model: GraphModel, relationshipsAsEdges: boolean): GraphModel {
  removeNonUmlNodes(model)
  refineNodesRecursively(model.root, { relationshipsAsEdges })
  replaceTagsWithTypes(model)
  validateModel(model, relationshipsAsEdges)
  printEdges(model)
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
  model.debug(
    `Re-rooted model with new root ${Uml.getType(newRoot)} (${newRoot.id})`,
  )
  model.root = newRoot
}

function refineNodesRecursively(
  node: GraphNode,
  configuration: HandlerConfiguration,
) {
  const handler = inferHandler(node)
  if (!handler) {
    const message = `No handler for node with tag ${
      node.tag
    } and type ${Uml.getType(node)}`
    if (node.model.settings.strict) {
      throw new Error(message)
    } else {
      node.model.debug(message)
    }
    return
  }
  try {
    handler.handle(node, configuration)
  } catch (error) {
    node.model.debug(getMessage(error))
    if (node.model.settings.strict) {
      throw error
    }
  }
  Stream.from(node.children).forEach((child) =>
    refineNodesRecursively(child, configuration),
  )
}

function replaceTagsWithTypes(model: GraphModel) {
  Stream.from(model.nodes).forEach((node) => {
    const type = Uml.getType(node)
    if (Uml.isValidType(type)) {
      node.tag = type
      return
    }
    if (!model.settings.strict) {
      return
    }
    throw new Error(`Unknown type ${type} on node ${node.id}`)
  })
}

function printEdges(model: GraphModel) {
  model.debug(`Created ${model.edges.size} edges`)
  model.debug(() =>
    Stream.from(model.edges)
      .map(
        (edge) =>
          `${edge.source.tag} (${edge.source.id}) --${edge.tag}-> ${edge.target.tag} (${edge.target.id})`,
      )
      .join('\n')
      .concat('\n'),
  )
}
