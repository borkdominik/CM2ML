import type { FeatureContext, FeatureVector } from '@cm2ml/feature-encoder'
import type { GraphEdge, GraphModel } from '@cm2ml/ir'
import { defineStructuredPlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export const formats = ['list', 'matrix'] as const
export type Format = typeof formats[number]

export const EdgeEncoder = defineStructuredPlugin({
  name: 'edge-encoder',
  parameters: {
    weighted: {
      type: 'boolean',
      description:
        'Output weighted values, depending on the number of incoming edges on an edge target.',
      defaultValue: false,
      group: 'graph',
    },
    format: {
      type: 'string',
      description: 'The format of adjacency data.',
      helpText: 'Warning: Using the matrix format can lead to large outputs and information loss if multiple edges exist between two nodes.',
      allowedValues: formats,
      defaultValue: formats[0],
      group: 'graph',
    },
  },
  invoke({ data, metadata: features }: { data: GraphModel, metadata: FeatureContext }, { format, weighted }) {
    const { staticData, getNodeFeatureVector, getEdgeFeatureVector } = features
    const sortedIds = getSortedIds(data)
    const sortedEdges = Array.from(data.edges).sort(createEdgeSorter(sortedIds))
    const edgeEncoder = format === 'list' ? encodeAsAdjacencyList : encodeAsAdjacencyMatrix
    const edgeEncoding = edgeEncoder(new Set(sortedEdges), sortedIds, weighted, getEdgeFeatureVector)

    const nodeFeatureVectors = Stream
      .from(sortedIds)
      .map((id) => data.getNodeById(id))
      .filterNonNull()
      .map(getNodeFeatureVector)
      .toArray()

    return {
      data: {
        ...edgeEncoding,
        nodeFeatureVectors,
      },
      metadata: staticData,
    }
  },
})

function getSortedIds(model: GraphModel) {
  return Stream.from(model.nodes)
    .map((node) => node.id)
    .filterNonNull()
    .toArray()
    .sort((a, b) => a.localeCompare(b))
}

export type AdjacencyList = [number, number][] | [number, number, number][]

function encodeAsAdjacencyList(
  edges: ReadonlySet<GraphEdge>,
  sortedIds: string[],
  weighted: boolean,
  getEdgeFeatureVector: (edge: GraphEdge) => FeatureVector,
) {
  const list = new Array<
    readonly [number, number] | readonly [number, number, number]
  >()
  const edgeFeatureVectors: FeatureVector[] = []
  const indexRecord = createIndexRecord(sortedIds)
  edges.forEach((edge) => {
    const sourceId = edge.source.requireId()
    const targetId = edge.target.requireId()
    const sourceIndex = indexRecord[sourceId]
    if (sourceIndex === undefined) {
      throw new Error(`Source node ${sourceId} not in model.`)
    }
    const targetIndex = indexRecord[targetId]
    if (targetIndex === undefined) {
      throw new Error(`Target node ${targetId} not in model.`)
    }
    const entry = weighted
      ? ([
          sourceIndex,
          targetIndex,
          getWeightedValue(edge),
        ] as const)
      : ([sourceIndex, targetIndex] as const)
    list.push(entry)
    edgeFeatureVectors.push(getEdgeFeatureVector(edge))
  })
  sortAdjacencyList(list as AdjacencyList)
  return {
    format: 'list' as const,
    list: list as AdjacencyList,
    nodes: sortedIds,
    edgeFeatureVectors,
  }
}

function sortAdjacencyList(list: AdjacencyList) {
  list.sort((a, b) => {
    const sourceIndexA = a[0]
    const sourceIndexB = b[0]
    if (sourceIndexA < sourceIndexB) {
      return -1
    }
    if (sourceIndexA > sourceIndexB) {
      return 1
    }
    const targetIndexA = a[1]
    const targetIndexB = b[1]
    if (targetIndexA < targetIndexB) {
      return -1
    }
    if (targetIndexA > targetIndexB) {
      return 1
    }
    return 0
  })
}

export type AdjacencyMatrix = number[][]

function encodeAsAdjacencyMatrix(
  edges: ReadonlySet<GraphEdge>,
  sortedIds: string[],
  weighted: boolean,
) {
  const matrix = createAdjacencyMatrix(sortedIds.length)
  fillAdjacencyMatrix(matrix, edges, sortedIds, weighted)
  return { format: 'matrix' as const, matrix, nodes: sortedIds, edgeFeatureVectors: [] }
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
  edges: ReadonlySet<GraphEdge>,
  sortedIds: string[],
  weighted: boolean,
) {
  const indexRecord = createIndexRecord(sortedIds)
  edges.forEach((edge) => {
    const sourceId = edge.source.requireId()
    const targetId = edge.target.requireId()
    const sourceIndex = indexRecord[sourceId]
    if (sourceIndex === undefined) {
      throw new Error(`Source node ${sourceId} not in model.`)
    }
    const targetIndex = indexRecord[targetId]
    if (targetIndex === undefined) {
      throw new Error(`Target node ${targetId} not in model.`)
    }
    const value = weighted ? getWeightedValue(edge) : 1
    matrix[sourceIndex]![targetIndex] = value
  })
}

function getWeightedValue(edge: GraphEdge) {
  return 1 / edge.target.incomingEdges.size
}

function createEdgeSorter(sortedIds: string[]) {
  return (a: GraphEdge, b: GraphEdge) => {
    const sourceIndexA = sortedIds.indexOf(a.source.requireId())
    const sourceIndexB = sortedIds.indexOf(b.source.requireId())
    if (sourceIndexA < sourceIndexB) {
      return -1
    }
    if (sourceIndexA > sourceIndexB) {
      return 1
    }
    const targetIndexA = sortedIds.indexOf(a.target.requireId())
    const targetIndexB = sortedIds.indexOf(b.target.requireId())
    if (targetIndexA < targetIndexB) {
      return -1
    }
    if (targetIndexA > targetIndexB) {
      return 1
    }
    return 0
  }
}

function createIndexRecord(sortedIds: string[]) {
  const indexRecord: Record<string, number> = {}
  sortedIds.forEach((id, index) => {
    indexRecord[id] = index
  })
  return indexRecord
}
