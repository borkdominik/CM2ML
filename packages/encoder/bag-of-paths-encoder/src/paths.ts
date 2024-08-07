import type { GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { PathParameters, WeightReduction } from './bop-types'

export function collectPaths(model: GraphModel, parameters: PathParameters): { path: number[], weight: number[] | number }[] {
  const nodes = Stream.from(model.nodes)
  const indexMap = new Map(nodes.map((node, i) => [node, i]))
  return nodes
    .flatMap((node) => Path.from(node, parameters))
    .filter((path) => path.steps.length >= parameters.minPathLength)
    .map((path) => {
      const getNodeIndex = (node: GraphNode) => indexMap.get(node)!
      return {
        path: [getNodeIndex(path.startNode), ...path.steps.map((step) => getNodeIndex(step.target))],
        weight: reduceWeights(path.steps.map((step) => step.weight), parameters.weightReduction),
      }
    },
    )
    .toArray()
}

class Path {
  private readonly nodeSet = new Set<GraphNode>()
  public constructor(public readonly startNode: GraphNode, private readonly endNode: GraphNode, public readonly steps: Step[], private readonly parameters: PathParameters) {
    this.nodeSet.add(startNode)
    this.nodeSet.add(endNode)
    for (const step of steps) {
      this.nodeSet.add(step.target)
    }
  }

  public hasNode(node: GraphNode) {
    return this.nodeSet.has(node)
  }

  private step(): Stream<Path> {
    if (this.steps.length >= this.parameters.maxPathLength) {
      return Stream.fromSingle(this)
    }
    const lastNode = this.endNode
    if (lastNode.outgoingEdges.size === 0) {
      return Stream.fromSingle(this)
    }
    const edgeGroups = new Map<GraphNode, [GraphEdge, ...GraphEdge[]]>()
    for (const edge of lastNode.outgoingEdges) {
      const target = edge.target
      if (this.hasNode(target)) {
        continue
      }
      if (edgeGroups.has(target)) {
        edgeGroups.get(target)!.push(edge)
      } else {
        edgeGroups.set(target, [edge])
      }
    }
    return Stream
      .from(edgeGroups.values())
      .map((edges) => new Step(edges, this.parameters))
      .flatMap((step) => this.extendPath(step))
  }

  private extendPath(step: Step) {
    return new Path(this.startNode, step.target, [...this.steps, step], this.parameters).step()
  }

  public static from(start: GraphNode, parameters: PathParameters) {
    return new Path(start, start, [], parameters).step()
  }
}

class Step {
  public constructor(public readonly edges: [GraphEdge, ...GraphEdge[]], private readonly parameters: PathParameters) { }

  public get source() {
    return this.edges[0].source
  }

  public get target() {
    return this.edges[0].target
  }

  public get weight() {
    if (this.parameters.weight === 'edge-count') {
      return this.edges.length
    }
    throw new Error(`Unsupported weight: ${this.parameters.weight}`)
  }
}

function reduceWeights(weights: number[], type: WeightReduction) {
  if (type === 'product') {
    return weights.reduce((a, b) => a * b, 1)
  }
  if (type === 'sum') {
    return weights.reduce((a, b) => a + b, 0)
  }
  if (type === 'length') {
    return weights.length
  }
  if (type === 'none') {
    return weights
  }
  throw new Error(`Unsupported weight reduction: ${type}`)
}
