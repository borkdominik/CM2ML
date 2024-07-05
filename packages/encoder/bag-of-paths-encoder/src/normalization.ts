import type { GraphNode } from '@cm2ml/ir'

export function normalizePartition(partition: Set<GraphNode>) {
  const labeledNodes = createLabeledNodes(partition)
  normalizeIndicesWithinLabelGroups(labeledNodes)
  return labeledNodes
}

export class LabeledNode {
  public readonly label: string | undefined

  public readonly incomingEdges: Set<LabeledNode> = new Set()
  public readonly outgoingEdges: Set<LabeledNode> = new Set()

  public constructor(
    public readonly graphNode: GraphNode,
    public index: number,
  ) {
    this.label = graphNode.type
  }

  public get id() {
    return `${this.label}_${this.index}`
  }
}

/**
 * Create labeled nodes from a partition of graph nodes.
 */
function createLabeledNodes(partition: Set<GraphNode>) {
  const labeledNodes = [...partition].map((node, index) => new LabeledNode(node, index))
  const nodeMap = new Map(labeledNodes.map((labeledNode) => [labeledNode.graphNode, labeledNode]))
  labeledNodes.forEach((labeledNode) => {
    labeledNode.graphNode.outgoingEdges.forEach((edge) => {
      if (!partition.has(edge.target)) {
        return
      }
      const target = nodeMap.get(edge.target)
      if (!target) {
        throw new Error(`Target node ${edge.target.id} of ${edge.source.id} not found. This is an internal error.`)
      }
      labeledNode.outgoingEdges.add(labeledNode)
      target.incomingEdges.add(labeledNode)
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
