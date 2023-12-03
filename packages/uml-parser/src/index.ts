import { GraphEdge } from '@cm2ml/ir'
import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { compose, definePlugin } from '@cm2ml/plugin'
import { XmiParser } from '@cm2ml/xmi-parser'
import { Stream } from '@yeger/streams'

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
  greedyEdges: boolean
): GraphModel {
  Stream.from(model.nodes)
    .flatMap((node) => createEdges(node, model, strict, greedyEdges))
    .forEach((edge) => model.addEdge(edge))
  // console.log(
  //   model.edges
  //     .map((edge) => `${edge.source.tag} --${edge.tag}-> ${edge.target.tag}`)
  //     .join('\n')
  // )
  return model
}

const ignoredTags: Readonly<string[]> = ['general']

function createEdges(
  node: GraphNode,
  model: GraphModel,
  strict: boolean,
  greedyEdges: boolean
): Stream<GraphEdge> {
  if (greedyEdges) {
    return createGreedyEdges(node, model)
  }
  if (ignoredTags.includes(node.tag)) {
    return Stream.from([])
  }
  switch (node.tag) {
    case 'generalization':
      return createGeneralizationEdges(node, model, strict)
    case 'packagedElement':
      return Stream.from([])
    default:
      if (strict) {
        throw new Error(`Unhandled tag: ${node.tag}`)
      }
      return Stream.from([])
  }
}

function createGreedyEdges(
  node: GraphNode,
  model: GraphModel
): Stream<GraphEdge> {
  return Stream.from(node.attributes)
    .filter(([, { name }]) => name !== model.idAttribute)
    .map(([_name, attribute]) => {
      const source = model.getNearestIdentifiableNode(node)
      if (!source) {
        return null
      }
      const attributeValue = attribute.value.literal
      const target = model.getNodeById(attributeValue)
      if (!target) {
        return null
      }
      const tag = attribute.name === 'idref' ? node.tag : attribute.name
      return new GraphEdge(tag, source, target)
    })
    .filterNonNull()
}

function createGeneralizationEdges(
  generalization: GraphNode,
  model: GraphModel,
  strict: boolean
): Stream<GraphEdge> {
  const source = generalization.parent
  if (!source) {
    if (strict) {
      throw new Error('Expected parent of <generalization />')
    }
    return Stream.from([])
  }
  const general = generalization.findChild((child) => child.tag === 'general')
  if (!general) {
    if (strict) {
      throw new Error('Expected <general /> child')
    }
    return Stream.from([])
  }
  const targetId = general.getAttribute('idref')?.value.literal
  if (!targetId) {
    if (strict) {
      throw new Error('Expected idref attribute on <general />')
    }
    return Stream.from([])
  }
  const target = model.getNodeById(targetId)
  if (!target) {
    if (strict) {
      throw new Error(`Expected node with id ${targetId}`)
    }
    return Stream.from([])
  }
  return Stream.from([new GraphEdge('generalization', source, target)])
}
