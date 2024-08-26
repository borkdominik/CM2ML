import type { GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { PathParameters, PathWeight } from './bop-types'
import { validatePathParameters } from './bop-validationts'

export interface PathData {
  steps: number[]
  stepWeights: number[]
  weight: number
}

function pathOrder(order: 'asc' | 'desc' | string) {
  return (a: PathData, b: PathData) => {
    const multiplier = order === 'asc' ? -1 : 1
    return multiplier * (() => {
      const weightDiff = b.weight - a.weight
      if (weightDiff !== 0) {
        return weightDiff
      }
      return a.steps.length - b.steps.length
    })()
  }
}

export function collectPaths(model: GraphModel, parameters: PathParameters) {
  validatePathParameters(parameters)
  const nodes = Stream.from(model.nodes)
  const indexMap = new Map(nodes.map((node, i) => [node, i]))
  const paths = nodes
    .flatMap((node) => Path.from(node, parameters))
    .filter((path) => path.steps.length >= parameters.minPathLength)
    .map<PathData>((path) => {
      const getNodeIndex = (node: GraphNode) => indexMap.get(node)!
      const stepWeights = path.steps.map((step) => step.weight)
      return {
        steps: [getNodeIndex(path.startNode), ...path.steps.map((step) => getNodeIndex(step.target))],
        stepWeights,
        weight: reduceWeights(stepWeights, parameters.pathWeight),
      }
    },
    )
    .toArray()
    .sort(pathOrder(parameters.order))
  if (parameters.maxPaths >= 0) {
    return paths.slice(0, parameters.maxPaths)
  }
  return paths
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

  private follow(isInitial = false): Stream<Path> {
    if (this.steps.length > this.parameters.maxPathLength) {
      throw new Error('Path is too long. This is an internal error.')
    }
    if (this.steps.length === this.parameters.maxPathLength) {
      return Stream.fromSingle(this)
    }
    const lastNode = this.endNode
    if (lastNode.outgoingEdges.size === 0) {
      // No more edges to extend path
      return Stream.fromSingle(this)
    }
    const edgeGroups = new Map<GraphNode, [GraphEdge, ...GraphEdge[]]>()
    for (const edge of lastNode.outgoingEdges) {
      const target = edge.target
      if (!this.parameters.allowCycles && this.hasNode(target)) {
        continue
      }
      if (edgeGroups.has(target)) {
        edgeGroups.get(target)!.push(edge)
      } else {
        edgeGroups.set(target, [edge])
      }
    }
    if (edgeGroups.size === 0) {
      // Outgoing edges exist, but target nodes are already in path
      return Stream.fromSingle(this)
    }
    const nextStream = Stream
      .from(edgeGroups.values())
      .map((edges) => new Step(edges, this.parameters))
      .flatMap((step) => this.extendPath(step))
    if (this.parameters.includeSubpaths || isInitial) {
      return nextStream.append(this)
    }
    return nextStream
  }

  private extendPath(step: Step) {
    return new Path(this.startNode, step.target, [...this.steps, step], this.parameters).follow()
  }

  public static from(start: GraphNode, parameters: PathParameters) {
    return new Path(start, start, [], parameters).follow(true)
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
    if (this.parameters.stepWeight === 'edge-count') {
      return this.edges.length
    }
    throw new Error(`Unsupported weight: ${this.parameters.stepWeight}`)
  }
}

function reduceWeights(weights: number[], type: PathWeight) {
  if (type === 'length') {
    return weights.length
  }
  if (type === 'step-product') {
    return weights.reduce((a, b) => a * b, 1)
  }
  if (type === 'step-sum') {
    return weights.reduce((a, b) => a + b, 0)
  }
  throw new Error(`Unsupported weight reduction: ${type}`)
}
