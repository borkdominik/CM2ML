import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { PathParameters } from './bop-types'

export function collectPaths(model: GraphModel, parameters: PathParameters) {
  return Stream
    .from(model.nodes)
    .flatMap((node) => Path.from(node, parameters))
    .map((path) => path.nodes)
    .map((nodes) => nodes.map((node) => node.id))
    .toArray()
}

class Path {
  private readonly nodeSet = new Set<GraphNode>()
  public constructor(public readonly nodes: [GraphNode, ...GraphNode[]], private readonly parameters: PathParameters) {
    for (const node of nodes) {
      this.nodeSet.add(node)
    }
  }

  public first() {
    return this.nodes[0]
  }

  public last(): GraphNode {
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
    const nextNodes = Stream
      .from(lastNode.outgoingEdges)
      .map((edge) => edge.target)
      .toSet()
      .difference(this.nodeSet)
    return Stream.from(nextNodes)
      .flatMap((node) => new Path([...this.nodes, node], this.parameters).step())
  }

  public static from(node: GraphNode, parameters: PathParameters) {
    return new Path([node], parameters).step()
  }
}
