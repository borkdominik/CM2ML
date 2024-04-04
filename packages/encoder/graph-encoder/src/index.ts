import type { Attributable, GraphEdge, GraphModel } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'

export const GraphEncoder = definePlugin({
  name: 'raw-graph',
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
  batchMetadataCollector: (models: GraphModel[]) => {
    const attributeNames = getAttributesNames(models)
    return { attributeNames }
  },
  invoke(input, { includeEqualPaths, sparse, weighted }, _batchMetadata) {
    const sortedIds = getSortedIds(input)
    if (sparse) {
      return encodeAsSparseList(input, sortedIds, includeEqualPaths, weighted)
    }
    return encodeAsAdjacencyMatrix(
      input,
      sortedIds,
      includeEqualPaths,
      weighted,
    )
  },
})

function getAttributesNames(models: GraphModel[]) {
  return Stream
    .from(models)
    .flatMap((model) => Stream
      .from<Attributable>(model.nodes)
      .concat(model.edges),
    )
    .flatMap((attributable) => Stream.from(attributable.attributes))
    .map(([attributeName]) => attributeName)
    .toSet()
}

function getSortedIds(model: GraphModel) {
  return Stream.from(model.nodes)
    .map((node) => node.id)
    .filterNonNull()
    .toArray()
    .sort((a, b) => a.localeCompare(b))
}

export type AdjacencyList = [number, number][] | [number, number, number][]

function encodeAsSparseList(
  model: GraphModel,
  sortedIds: string[],
  includeEqualPaths: boolean,
  weighted: boolean,
) {
  const list = new Array<
    readonly [number, number] | readonly [number, number, number]
  >()
  const relevantEdges = getRelevantEdges(model, includeEqualPaths)
  relevantEdges.forEach((edge) => {
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
      ? ([
          sourceIndex,
          targetIndex,
          getWeightedValue(edge, relevantEdges),
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
  model: GraphModel,
  sortedIds: string[],
  includeEqualPaths: boolean,
  weighted: boolean,
) {
  const matrix = createAdjacencyMatrix(sortedIds.length)
  fillAdjacencyMatrix(matrix, model, sortedIds, includeEqualPaths, weighted)
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
  model: GraphModel,
  sortedIds: string[],
  includeEqualPaths: boolean,
  weighted: boolean,
) {
  const relevantEdges = getRelevantEdges(model, includeEqualPaths)
  relevantEdges.forEach((edge) => {
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
    const value = weighted ? getWeightedValue(edge, relevantEdges) : 1
    matrix[sourceIndex]![targetIndex] = value
  })
}

function getWeightedValue(
  edge: GraphEdge,
  relevantEdges: ReadonlySet<GraphEdge>,
) {
  if (relevantEdges.size === edge.model.edges.size) {
    return 1 / edge.target.incomingEdges.size
  }
  const relevantIncomingEdges = Stream.from(edge.target.incomingEdges)
    .map((incomingEdge) => (relevantEdges.has(incomingEdge) ? 1 : 0))
    .sum()
  return 1 / relevantIncomingEdges
}

function getRelevantEdges(model: GraphModel, includeEqualPaths: boolean) {
  if (includeEqualPaths) {
    return model.edges
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
  return edges
}
