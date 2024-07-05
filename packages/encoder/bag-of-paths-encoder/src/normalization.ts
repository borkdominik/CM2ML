import type { GraphEdge, GraphNode } from '@cm2ml/ir'

export function normalizePartition(partition: Set<GraphNode>) {
  const labelGroups = groupNodesByType(partition)
  return createLabeledNodes(labelGroups, partition)
}

export class LabeledNode {
  public readonly label: string | undefined

  public readonly incomingEdges: Set<LabeledEdge> = new Set()
  public readonly outgoingEdges: Set<LabeledEdge> = new Set()

  public readonly id: string

  public constructor(
    public readonly data: GraphNode,
    public readonly index: number,
  ) {
    this.label = data.type
    this.id = `${this.label ?? 'unknown'}_${this.index}`
  }
}

export class LabeledEdge {
  public constructor(
    public readonly source: LabeledNode,
    public readonly target: LabeledNode,
    public readonly data: GraphEdge,
  ) {}
}

/**
 * Create labeled nodes from grouped nodes.
 */
function createLabeledNodes(labelGroups: GraphNode[][], partition: Set<GraphNode>) {
  const labeledNodes = labelGroups.flatMap((labelGroup) => labelGroup.map((node, index) => new LabeledNode(node, index)))
  const nodeMap = new Map(labeledNodes.map((labeledNode) => [labeledNode.data, labeledNode]))
  labeledNodes.forEach((labeledNode) => {
    labeledNode.data.outgoingEdges.forEach((edge) => {
      if (!partition.has(edge.target)) {
        // labeledNode was added via restoration and edge/edge.target is not part of the partition
        return
      }
      const target = nodeMap.get(edge.target)
      if (!target) {
        throw new Error(`Target node ${edge.target.id} of ${edge.source.id} not found. This is an internal error.`)
      }
      const labeledEdge = new LabeledEdge(labeledNode, target, edge)
      labeledNode.outgoingEdges.add(labeledEdge)
      target.incomingEdges.add(labeledEdge)
    })
  })
  return labeledNodes
}

const NO_TYPE_SYMBOL = Symbol('NO_TYPE')

/**
 * Group nodes by their type.
 */
function groupNodesByType(nodes: Set<GraphNode>): GraphNode[][] {
  const groupRecord = Object.groupBy(nodes, (node) => node.type ?? NO_TYPE_SYMBOL)
  return Object
    .values(groupRecord)
    .filter((group) => group !== undefined)
}
