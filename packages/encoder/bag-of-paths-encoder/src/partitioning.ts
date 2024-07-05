import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import { recursiveKernighanLin } from 'kernighan-lin'

import type { BoPParameters } from './bop-types'

export function partitionNodes(model: GraphModel, parameters: BoPParameters): Set<GraphNode>[] {
  const cost = parameters.costType === 'edge-count' ? edgeCountCost : undefined
  return recursiveKernighanLin(
    model.nodes,
    getConnectedNodes,
    { ...parameters, cost },
  )
}

function getConnectedNodes(node: GraphNode): Set<GraphNode> {
  const incoming = Stream.from(node.incomingEdges).map((edge) => edge.source)
  const outgoing = Stream.from(node.outgoingEdges).map((edge) => edge.target)
  return incoming.concat(outgoing).toSet()
}

function edgeCountCost(a: GraphNode, b: GraphNode) {
  const incoming = Stream.from(a.incomingEdges).filter((edge) => edge.source === b)
  const outgoing = Stream.from(a.outgoingEdges).filter((edge) => edge.target === b)
  return incoming.concat(outgoing).toArray().length
}
