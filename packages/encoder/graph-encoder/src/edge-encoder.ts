import type { FeatureEncoder } from '@cm2ml/feature-encoder'
import type { GraphEdge, GraphModel } from '@cm2ml/ir'
import type { InferOut } from '@cm2ml/plugin'
import { METADATA_KEY, definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export const EdgeEncoder = definePlugin({
  name: 'edge-encoder',
  parameters: {
    weighted: {
      type: 'boolean',
      description:
        'Output weighted values, depending on the number of incoming edges on an edge target.',
      defaultValue: false,
    },
    sparse: {
      type: 'boolean',
      description: 'Encode the graph as a sparse list.',
      defaultValue: true,
    },
    includeEqualPaths: {
      type: 'boolean',
      description:
        'Include equal paths, i.e., edges that have the same source and target, more than once.',
      defaultValue: false,
    },
  },
  invoke({ input, features }: InferOut<typeof FeatureEncoder>, { includeEqualPaths, sparse, weighted }) {
    const sortedIds = getSortedIds(input)
    const sortedEdges = getRelevantEdges(input, includeEqualPaths).toArray().sort(createEdgeSorter(sortedIds))
    const edgeEncoder = sparse ? encodeAsSparseList : encodeAsAdjacencyMatrix
    const edgeEncoding = edgeEncoder(new Set(sortedEdges), sortedIds, weighted)

    const { nodeFeatures, getNodeFeatureVector, edgeFeatures, getEdgeFeatureVector } = features

    const nodeFeatureVectors = Stream
      .from(sortedIds)
      .map((id) => input.getNodeById(id))
      .filterNonNull()
      .map(getNodeFeatureVector)
      .toArray()

    const edgeFeatureVectors = sortedEdges.map(getEdgeFeatureVector)

    return {
      ...edgeEncoding,
      nodeFeatureVectors,
      edgeFeatureVectors,
      [METADATA_KEY]: {
        edgeFeatures,
        nodeFeatures,
      },
    }
  },
})

// TODO/Jan: Require IDs to be set?
function getSortedIds(model: GraphModel) {
  return Stream.from(model.nodes)
    .map((node) => node.id)
    .filterNonNull()
    .toArray()
    .sort((a, b) => a.localeCompare(b))
}

export type AdjacencyList = [number, number][] | [number, number, number][]

function encodeAsSparseList(
  edges: ReadonlySet<GraphEdge>,
  sortedIds: string[],
  weighted: boolean,
) {
  const list = new Array<
    readonly [number, number] | readonly [number, number, number]
    >()
  const indexRecord = createIndexRecord(sortedIds)
  edges.forEach((edge) => {
    const sourceId = edge.source.id
    const targetId = edge.target.id
    if (sourceId === undefined) {
      throw new Error('Missing id attribute in source element.')
    }
    if (targetId === undefined) {
      throw new Error('Missing id attribute in target element.')
    }
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
          getWeightedValue(edge, edges),
        ] as const)
      : ([sourceIndex, targetIndex] as const)
    list.push(entry)
  })
  sortAdjacencyList(list as AdjacencyList)
  return {
    format: 'list' as const,
    list: list as AdjacencyList,
    nodes: sortedIds,
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
  return { format: 'matrix' as const, matrix, nodes: sortedIds }
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
    const sourceId = edge.source.id
    const targetId = edge.target.id
    if (sourceId === undefined) {
      throw new Error('Missing id attribute in source element.')
    }
    if (targetId === undefined) {
      throw new Error('Missing id attribute in target element.')
    }
    const sourceIndex = indexRecord[sourceId]
    if (sourceIndex === undefined) {
      throw new Error(`Source node ${sourceId} not in model.`)
    }
    const targetIndex = indexRecord[targetId]
    if (targetIndex === undefined) {
      throw new Error(`Target node ${targetId} not in model.`)
    }
    const value = weighted ? getWeightedValue(edge, edges) : 1
    matrix[sourceIndex]![targetIndex] = value
  })
}

function getWeightedValue(
  edge: GraphEdge,
  edges: ReadonlySet<GraphEdge>,
) {
  if (edges.size === edge.model.edges.size) {
    return 1 / edge.target.incomingEdges.size
  }
  const relevantIncomingEdges = Stream.from(edge.target.incomingEdges)
    .map((incomingEdge) => (edges.has(incomingEdge) ? 1 : 0))
    .sum()
  return 1 / relevantIncomingEdges
}

function getRelevantEdges(model: GraphModel, includeEqualPaths: boolean) {
  if (includeEqualPaths) {
    return Stream.from(model.edges)
  }
  const edges = new Set<GraphEdge>()
  const consideredEdgePaths = new Map<string, Set<string>>()
  model.edges.forEach((edge) => {
    const sourceId = edge.source.id
    const targetId = edge.target.id
    if (sourceId === undefined || targetId === undefined) {
      return
    }
    const pathsFromSource = consideredEdgePaths.get(sourceId)
    if (pathsFromSource !== undefined && pathsFromSource.has(targetId)) {
      return
    } else if (pathsFromSource === undefined) {
      const newPathsFromSource = new Set<string>()
      newPathsFromSource.add(targetId)
      consideredEdgePaths.set(sourceId, newPathsFromSource)
    } else {
      pathsFromSource.add(targetId)
    }
    edges.add(edge)
  })
  return Stream.from(edges)
}

function createEdgeSorter(sortedIds: string[]) {
  return (a: GraphEdge, b: GraphEdge) => {
    const sourceIndexA = sortedIds.indexOf(a.source.id!)
    const sourceIndexB = sortedIds.indexOf(b.source.id!)
    if (sourceIndexA < sourceIndexB) {
      return -1
    }
    if (sourceIndexA > sourceIndexB) {
      return 1
    }
    const targetIndexA = sortedIds.indexOf(a.target.id!)
    const targetIndexB = sortedIds.indexOf(b.target.id!)
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