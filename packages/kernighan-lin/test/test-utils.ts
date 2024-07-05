export class GraphVertex {
  public constructor(public readonly value: string) { }

  public readonly incomingEdges: GraphVertex[] = []
  public readonly outgoingEdges: GraphVertex[] = []
}

export function createTestGraph(values: string[], edges: [string, string][] | (readonly [string, string])[]) {
  const vertexMap = new Map<string, GraphVertex>()
  values.forEach((value) => vertexMap.set(value, new GraphVertex(value)))
  edges.forEach(([sourceValue, targetValue]) => {
    const source = vertexMap.get(sourceValue)
    const target = vertexMap.get(targetValue)
    if (source && target) {
      source.outgoingEdges.push(target)
      target.incomingEdges.push(source)
    } else {
      throw new Error(`Invalid edge: ${sourceValue} -> ${targetValue}`)
    }
  })
  return new Set(vertexMap.values())
}

export function mapToValues(partitions: readonly [Set<GraphVertex>, Set<GraphVertex>]) {
  return partitions
    .map((vertices) =>
      [...vertices].map((vertex) => vertex.value).sort(),
    )
    .sort((a, b) =>
      a[0]?.localeCompare(b[0] ?? '') ?? 0,
    )
}

export function getConnectedVertices(vertex: GraphVertex) {
  return new Set(vertex.outgoingEdges.concat(vertex.incomingEdges))
}

export function cost(a: GraphVertex, b: GraphVertex) {
  return a.incomingEdges.filter((edge) => edge === b).length + a.outgoingEdges.filter((edge) => edge === b).length
}
