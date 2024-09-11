import type { GraphEdge, GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { PathParameters, PathWeight } from './bop-types'
import { validatePathParameters } from './bop-validationts'
import type { StepWeighting } from './templates/model'
import { compileStepWeighting } from './templates/parser'

export interface StepData {
  node: GraphNode
  via: GraphEdge | undefined
}

export interface PathData {
  steps: StepData[]
  stepWeights: number[]
  weight: number
}

function pathOrder(order: 'asc' | 'desc' | string) {
  return (a: Omit<PathData, 'encodedSteps'>, b: Omit<PathData, 'encodedSteps'>) => {
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
  const compiledStepWeighting = parameters.stepWeighting.map((weighting) => compileStepWeighting(weighting))
  const nodes = Stream.from(model.nodes)
  const paths = nodes
    .flatMap((node) => Path.from(node, parameters))
    .filter((path) => path.steps.length >= parameters.minPathLength)
    .map<Omit<PathData, 'encodedSteps'>>((path) => {
      const stepWeights = getStepWeights(path.steps, compiledStepWeighting)
      return {
        steps: [{ node: path.startNode, via: undefined }, ...path.steps.map((step) => ({ node: step.target, via: step }))],
        stepWeights,
        weight: reduceWeights(stepWeights, parameters.pathWeight),
      }
    },
    )
    .toArray()
    .sort(pathOrder(parameters.order))
  if (parameters.maxPaths > 0) {
    return paths.slice(0, parameters.maxPaths)
  }
  return paths
}

class Path {
  private readonly nodeSet = new Set<GraphNode>()
  public constructor(public readonly startNode: GraphNode, private readonly endNode: GraphNode, public readonly steps: GraphEdge[], private readonly parameters: PathParameters) {
    this.nodeSet.add(startNode)
    this.nodeSet.add(endNode)
    for (const step of steps) {
      this.nodeSet.add(step.target)
    }
  }

  public hasNode(node: GraphNode) {
    return this.nodeSet.has(node)
  }

  private follow(): Stream<Path> {
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
    const nextEdges = Stream.from(lastNode.outgoingEdges).filter((edge) => this.parameters.allowCycles || !this.hasNode(edge.target)).toArray()
    if (nextEdges.length === 0) {
      // Outgoing edges exist, but target nodes are already in path
      return Stream.fromSingle(this)
    }
    const nextStream = Stream
      .from(nextEdges)
      .flatMap((step) => this.extendPath(step))
    return nextStream.append(this)
  }

  private extendPath(step: GraphEdge) {
    return new Path(this.startNode, step.target, [...this.steps, step], this.parameters).follow()
  }

  public static from(start: GraphNode, parameters: PathParameters) {
    return new Path(start, start, [], parameters).follow()
  }
}

function getStepWeights(steps: GraphEdge[], weightings: StepWeighting[]) {
  return Stream
    .from(steps)
    .map((step, stepIndex) => getStepWeight(step, stepIndex, steps.length, weightings))
    .toArray()
}

function getStepWeight(step: GraphEdge, stepIndex: number, pathLength: number, weightings: StepWeighting[]) {
  return Stream
    .from(weightings)
    .map((weighting) => weighting(step, { length: pathLength, step: stepIndex + 1 }))
    .find((weight) => weight !== undefined) ?? 1
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
