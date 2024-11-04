import type { GraphEdge, GraphNode } from '@cm2ml/ir'

import type { NormalizationParameters } from './pattern-types'

/**
 * Maps the ID of a labeled node to the IDs of the nodes in the original graph.
 */
export type PatternMapping = Record<string, string[]>

export function normalizePartitions(partitions: Set<GraphNode>[], parameters: NormalizationParameters) {
  const normalizedLabeledNodes: LabeledNode[][] = []
  const crossPartitionMapping: Record<string, Set<string>> = {}
  partitions.forEach((partition) => {
    const { labeledNodes, mapping } = normalizePartition(partition, parameters)
    normalizedLabeledNodes.push(labeledNodes)
    Object.entries(mapping).forEach(([labeledNodeId, graphNodeId]) => {
      if (!crossPartitionMapping[labeledNodeId]) {
        crossPartitionMapping[labeledNodeId] = new Set()
      }
      if (!graphNodeId) {
        return
      }
      crossPartitionMapping[labeledNodeId].add(graphNodeId)
    })
  })
  const mapping: PatternMapping = Object
    .fromEntries(Object.entries(crossPartitionMapping)
      .map(([key, value]) => [key, Array.from(value)]))
  return {
    normalizedPartitions: normalizedLabeledNodes,
    mapping,
  }
}

function normalizePartition(partition: Set<GraphNode>, { maskNodeTypes }: NormalizationParameters) {
  const labelGroups = groupNodesByType(partition, maskNodeTypes)
  const labeledNodes = createLabeledNodes(labelGroups, partition, maskNodeTypes)
  const mapping = Object.fromEntries(labeledNodes.map((node) => [node.id, node.data.id]))
  return { labeledNodes, mapping }
}

const maskedNodeType = '<node>'

export class LabeledNode {
  public readonly label: string | undefined

  public readonly incomingEdges: Set<LabeledEdge> = new Set()
  public readonly outgoingEdges: Set<LabeledEdge> = new Set()

  public readonly id: string

  public constructor(
    public readonly data: GraphNode,
    public readonly index: number,
    maskNodeType: boolean,
  ) {
    this.label = maskNodeType ? maskedNodeType : data.type
    this.id = `${this.label ?? 'unknown'}_${this.index}`
  }
}

export interface SerializedLabeledEdge {
  source: string
  target: string
  tag: string
}

export class LabeledEdge {
  public readonly id: string
  public constructor(
    public readonly source: LabeledNode,
    public readonly target: LabeledNode,
    public readonly data: GraphEdge,
  ) {
    this.id = `"${this.source.id}"->"${this.target.id}"[label="${this.data.tag ?? ''}"]`
  }

  public serialize(): SerializedLabeledEdge {
    return {
      source: this.source.id,
      target: this.target.id,
      tag: this.data.tag,
    }
  }
}

/**
 * Create labeled nodes from grouped nodes.
 */
function createLabeledNodes(labelGroups: GraphNode[][], partition: Set<GraphNode>, maskNodeTypes: boolean) {
  const labeledNodes = labelGroups.flatMap((labelGroup) => labelGroup.map((node, index) => new LabeledNode(node, index, maskNodeTypes)))
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
function groupNodesByType(nodes: Set<GraphNode>, maskNodeTypes: boolean): GraphNode[][] {
  const groupRecord = Object.groupBy(nodes, (node) => maskNodeTypes ? maskedNodeType : (node.type ?? NO_TYPE_SYMBOL))
  return Object
    .values(groupRecord)
    .filter((group) => group !== undefined)
}
