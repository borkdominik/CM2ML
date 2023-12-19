import type { GraphEdge, GraphModel } from '@cm2ml/ir'
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
    const sortedIds = getSortedIds(input)
    if (sparse) {
      return encodeAsSparseList(input, sortedIds, weighted)
    }
    return encodeAsAdjacencyMatrix(input, sortedIds, weighted)
  },
})

function getSortedIds(model: GraphModel) {
  return Stream.from(model.nodes)
    .map((node) => node.id)
    .filterNonNull()
    .toArray()
    .sort((a, b) => a.localeCompare(b))
}

function encodeAsSparseList(
  model: GraphModel,
  sortedIds: string[],
  weighted: boolean,
) {
  const list = new Array<
    readonly [number, number] | readonly [number, number, number]
  >()
  model.edges.forEach((edge) => {
    const sourceId = edge.source.id
    const targetId = edge.target.id
    if (sourceId === undefined) {
      throw new Error('Missing id attribute in source element.')
    }
    if (targetId === undefined) {
      throw new Error('Missing id attribute in target element.')
    }
    const sourceIndex = sortedIds.indexOf(sourceId)
    const targetIndex = sortedIds.indexOf(targetId)
    const entry = weighted
      ? ([sourceIndex, targetIndex, getWeightedValue(edge)] as const)
      : ([sourceIndex, targetIndex] as const)
    list.push(entry)
  })
  return { list, nodes: sortedIds }
}

type AdjacencyMatrix = number[][]

function encodeAsAdjacencyMatrix(
  model: GraphModel,
  sortedIds: string[],
  weighted: boolean,
) {
  const matrix = createAdjacencyMatrix(sortedIds.length)
  fillAdjacencyMatrix(matrix, model, sortedIds, weighted)
  return { matrix, nodes: sortedIds }
}

function createAdjacencyMatrix(size: number): AdjacencyMatrix {
  const matrix = Array.from<number[]>({ length: size })
  for (let i = 0; i < size; i++) {
    matrix[i] = Array.from<number>({ length: size }).fill(0)
  }
  return matrix
}

function fillAdjacencyMatrix(
  matrix: AdjacencyMatrix,
  model: GraphModel,
  sortedIds: string[],
  weighted: boolean,
) {
  model.edges.forEach((edge) => {
    const sourceId = edge.source.id
    const targetId = edge.target.id
    if (sourceId === undefined) {
      throw new Error('Missing id attribute in source element.')
    }
    if (targetId === undefined) {
      throw new Error('Missing id attribute in target element.')
    }
    const sourceIndex = sortedIds.indexOf(sourceId)
    const targetIndex = sortedIds.indexOf(targetId)
    const value = weighted ? getWeightedValue(edge) : 1
    matrix[sourceIndex]![targetIndex] = value
  })
}

function getWeightedValue(edge: GraphEdge) {
  return 1 / edge.target.incomingEdges.size
}
