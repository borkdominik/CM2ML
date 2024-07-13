export interface PartitioningParameters {
  maxPartitioningIterations: number
  maxPartitionSize: number
  costType: 'edge-count' | 'constant' | (string & Record<never, never>)
}

export interface NormalizationParameters {
  maskNodeTypes: boolean
}

export interface MiningParameters {
  minPatternLength: number
  maxPatternLength: number
  maxPatternsPerPartition: number
  closedPatterns: boolean
}

export type PatternOrder = 'absolute-frequency' | 'model-frequency' | (string & Record<never, never>)

export interface FrequencyParameters {
  minAbsoluteFrequency: number
  minModelFrequency: number
  maxPatterns: number
  patternOrder: PatternOrder
}
