import type { FeatureContext } from '@cm2ml/feature-encoder'
import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { PathData } from './paths'

export const nodeEncodingTypes = [
  'attributes',
  'path-count',
  'path-weight',
  // 'discounted-path-sum',
] as const

export type NodeEncodingType = typeof nodeEncodingTypes[number]

export interface NodeEncodingParameters {
  nodeEncoding: readonly (NodeEncodingType | string & Record<never, never>) []
}

interface NodeEncoderContext {
  nodeIndex: number
  node: GraphNode
  featureContext: FeatureContext
  paths: Set<PathData>
  parameters: NodeEncodingParameters
  /** The length of the longest path of the model. */
  longestPathLength: number
  /** The highest number of paths for any node in the model. */
  highestPathCount: number
}

export type NodeEncoding = ReturnType<typeof encodeNode>

export function encodeNode(context: NodeEncoderContext) {
  const pathEncodingTypes = new Set(context.parameters.nodeEncoding)
  function withSelected<T extends (boolean | number | string | null)[]>(name: NodeEncodingType, encoder: (context: NodeEncoderContext) => T) {
    return pathEncodingTypes.has(name) ? encoder(context) : undefined
  }
  return {
    'attributes': withSelected('attributes', encodeNodeAttributes),
    'path-count': withSelected('path-count', encodePathCount),
    'path-weight': withSelected('path-weight', encodePathWeight),
  } satisfies Record<NodeEncodingType, unknown>
}

/**
 * Feature vector for the node's attributes.
 */
function encodeNodeAttributes(context: NodeEncoderContext) {
  return context.featureContext.getNodeFeatureVector(context.node)
}

/**
 * Feature vector for the number of paths of each length.
 * Index is offset by one, e.g., the number of paths of length 1 is at index 0.
 */
export type PathCounts = number[]

function encodePathCount(context: NodeEncoderContext): PathCounts {
  return Array.from({ length: context.longestPathLength }).map((_, length) => {
    return Stream.from(context.paths).filter((path) => path.steps.length === length + 1).toArray().length
  })
}

/**
 * Feature vector for the weights of the paths, right-padded with zeros.
 */
export type PathWeights = number[]

function encodePathWeight(context: NodeEncoderContext): PathWeights {
  const weights = Stream.from(context.paths).map((path) => path.weight)
  const padding = Array.from({ length: context.highestPathCount - context.paths.size }).map(() => 0)
  return weights.concat(padding).toArray()
}
