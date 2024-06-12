import { FeatureEncoder } from '@cm2ml/feature-encoder'
import { batchTryCatch, compose } from '@cm2ml/plugin'

import { EdgeEncoder } from './edge-encoder'

export type { AdjacencyList, AdjacencyMatrix } from './edge-encoder'

export const GraphEncoder = compose(FeatureEncoder, batchTryCatch(EdgeEncoder), 'raw-graph')
