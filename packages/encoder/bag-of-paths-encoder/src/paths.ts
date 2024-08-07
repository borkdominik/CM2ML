import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { PathParameters } from './bop-types'

export function collectPaths(model: GraphModel, parameters: PathParameters) {
  const nodes = Stream.from(model.nodes)
  const indexMap = new Map(nodes.map((node, i) => [node, i]))
  return nodes
    .flatMap((node, i) => Path.from(node, i, parameters))
    .filter((path) => path.nodes.length >= parameters.minPathLength)
    .map((path) => path.nodes.map((node) => indexMap.get(node)!))
    .toArray()
}

class Path {
  private readonly nodeSet = new Set<GraphNode>()
  public constructor(public readonly nodes: [GraphNode, ...GraphNode[]], public readonly startNodeIndex: number, private readonly parameters: PathParameters) {
    for (const node of nodes) {
      this.nodeSet.add(node)
    }
  }

  public first() {
    return this.nodes[0]
  }

  public last() {
    return this.nodes[this.nodes.length - 1]!
  }

  public hasNode(node: GraphNode) {
    return this.nodeSet.has(node)
  }

  private step(): Stream<Path> {
    if (this.nodes.length >= this.parameters.maxPathLength) {
      return Stream.fromSingle(this)
    }
    const lastNode = this.last()
    if (lastNode.outgoingEdges.size === 0) {
      return Stream.fromSingle(this)
    }
    return Stream
      .from(lastNode.outgoingEdges)
      .map((edge) => edge.target)
      .filter((node) => !this.hasNode(node))
      .distinct()
      .flatMap((node) => this.extendPath(node))
  }

  private extendPath(graphNode: GraphNode) {
    return new Path([...this.nodes, graphNode], this.startNodeIndex, this.parameters).step()
  }

  public static from(start: GraphNode, startNodeIndex: number, parameters: PathParameters) {
    return new Path([start], startNodeIndex, parameters).step()
  }
}
