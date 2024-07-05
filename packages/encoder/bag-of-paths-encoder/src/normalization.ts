import type { GraphEdge, GraphNode } from '@cm2ml/ir'

export function normalizePartition(partition: Set<GraphNode>) {
  const labeledNodes = createLabeledNodes(partition)
  normalizeIndicesWithinLabelGroups(labeledNodes)
  return labeledNodes
}

export class LabeledNode {
  public readonly label: string | undefined

  public readonly incomingEdges: Set<LabeledEdge> = new Set()
  public readonly outgoingEdges: Set<LabeledEdge> = new Set()

  public constructor(
    public readonly data: GraphNode,
    public index: number,
  ) {
    this.label = data.type
  }

  public get id() {
    return `${this.label}_${this.index}`
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
 * Create labeled nodes from a partition of graph nodes.
 */
function createLabeledNodes(partition: Set<GraphNode>) {
  const labeledNodes = [...partition].map((node, index) => new LabeledNode(node, index))
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

/**
 * Update the indices of labeled nodes to be consecutive within each label group.
 */
function normalizeIndicesWithinLabelGroups(labeledNodes: LabeledNode[]) {
  const missingLabelSymbol = Symbol('NO_LABEL')
  const labelGroups = new Map<string | symbol, LabeledNode[]>()
  labeledNodes.forEach((labeledNode) => {
    const key = labeledNode.label ?? missingLabelSymbol
    if (!labelGroups.has(key)) {
      labelGroups.set(key, [])
    }
    labelGroups.get(key)!.push(labeledNode)
  })
  labelGroups.forEach((nodes) => {
    nodes.sort((a, b) => a.index - b.index)
  })
  labelGroups.forEach((nodes) => {
    let currentIndex = 0
    nodes.forEach((node) => {
      node.index = currentIndex
      currentIndex++
    })
  })
}
