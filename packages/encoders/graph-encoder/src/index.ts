import { FeatureEncoder } from '@cm2ml/feature-encoder'
import { batchTryCatch, compose } from '@cm2ml/plugin'

import { EdgeEncoder } from './edge-encoder'

export type { AdjacencyEncoding, AdjacencyList, AdjacencyListEncoding, AdjacencyMatrix, AdjacencyMatrixEncoding } from './edge-encoder'

/**
 * Encodes a graph model as a raw graph with feature vectors and adjacency data.
 *
 * **Requirements:**
 * - Each node must have a unique id.
 */
export const GraphEncoder = compose(FeatureEncoder, batchTryCatch(EdgeEncoder), 'raw-graph')
