import type { GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export const GraphEncoder = definePlugin({
  name: 'raw-graph',
  parameters: {
    weighted: {
      type: 'boolean',
      description: 'Whether to encode the graph as a weighted matrix.',
      defaultValue: false,
    },
    sparse: {
      type: 'boolean',
      description: 'Whether to encode the graph as a sparse list.',
      defaultValue: false,
    },
  },
  invoke(input: GraphModel, { sparse, weighted }) {
    if (sparse && weighted) {
      throw new Error('Sparse and weighted options are mutually exclusive.')
    }
    const sortedIds = getSortedIds(input)
    if (sparse) {
      return encodeAsSparseList(input, sortedIds)
    }
    return encodeAsAdjacencyMatrix(input, sortedIds, weighted)
  },
})

function getSortedIds(model: GraphModel) {
  return Stream.from(model.nodes)
    .map((node) => model.getNodeId(node))
    .filterNonNull()
    .toArray()
    .sort((a, b) => a.localeCompare(b))
}

function encodeAsSparseList(model: GraphModel, sortedIds: string[]) {
  const list = new Array<readonly [number, number]>()
  model.edges.forEach((edge) => {
    const source = model.getNodeId(edge.source)
    const target = model.getNodeId(edge.target)
    if (source === undefined) {
      throw new Error('Missing id attribute in source element.')
    }
    if (target === undefined) {
      throw new Error('Missing id attribute in target element.')
    }
    const sourceIndex = sortedIds.indexOf(source)
    const targetIndex = sortedIds.indexOf(target)
    list.push([sourceIndex, targetIndex] as const)
  })
  return { list, nodes: sortedIds }
}

type AdjacencyMatrix = number[][]

function encodeAsAdjacencyMatrix(
  model: GraphModel,
  sortedIds: string[],
  weighted: boolean
) {
  const matrix = createAdjacencyMatrix(sortedIds.length)
  fillAdjacencyMatrix(matrix, model, sortedIds, weighted)
  return { matrix, nodes: sortedIds }
}

function createAdjacencyMatrix(size: number): AdjacencyMatrix {
  const matrix = new Array(size)
  for (let i = 0; i < size; i++) {
    matrix[i] = new Array(size).fill(0)
  }
  return matrix
}

function fillAdjacencyMatrix(
  matrix: AdjacencyMatrix,
  model: GraphModel,
  sortedIds: string[],
  weighted: boolean
) {
  model.edges.forEach((edge) => {
    const source = model.getNodeId(edge.source)
    const target = model.getNodeId(edge.target)
    if (source === undefined) {
      throw new Error('Missing id attribute in source element.')
    }
    if (target === undefined) {
      throw new Error('Missing id attribute in target element.')
    }
    const sourceIndex = sortedIds.indexOf(source)
    const targetIndex = sortedIds.indexOf(target)
    const value = weighted ? 1 / edge.target.incomingEdges.size : 1
    matrix[sourceIndex]![targetIndex] = value
  })
}
