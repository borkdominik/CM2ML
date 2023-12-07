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
  Stream.from(model.nodes).forEach((node) =>
    createEdges(node, strict, greedyEdges)
  )
  // console.log(
  //   model.edges
  //     .map((edge) => `${edge.source.tag} --${edge.tag}-> ${edge.target.tag}`)
  //     .join('\n')
  // )
  return model
}

const ignoredTags: Readonly<string[]> = ['general']

function createEdges(node: GraphNode, strict: boolean, greedyEdges: boolean) {
  if (greedyEdges) {
    createGreedyEdges(node)
    return
  }
  if (ignoredTags.includes(node.tag)) {
    return
  }
  switch (node.tag) {
    case 'generalization':
      createGeneralizationEdges(node, strict)
      return
    case 'packagedElement':
      return
    default:
      if (strict) {
        throw new Error(`Unhandled tag: ${node.tag}`)
      }
  }
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

function createGeneralizationEdges(generalization: GraphNode, strict: boolean) {
  const source = generalization.parent
  if (!source) {
    if (strict) {
      throw new Error('Expected parent of <generalization />')
    }
    return
  }
  const general = generalization.findChild((child) => child.tag === 'general')
  if (!general) {
    if (strict) {
      throw new Error('Expected <general /> child')
    }
    return
  }
  const targetId = general.getAttribute('idref')?.value.literal
  if (!targetId) {
    if (strict) {
      throw new Error('Expected idref attribute on <general />')
    }
    return
  }
  const target = generalization.model.getNodeById(targetId)
  if (!target) {
    if (strict) {
      throw new Error(`Expected node with id ${targetId}`)
    }
    return
  }
  generalization.model.addEdge('generalization', source, target)
}
