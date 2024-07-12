export interface PartitioningParameters {
  maxPartitioningIterations: number
  maxPartitionSize: number
  costType: 'edge-count' | 'constant' | (string & Record<never, never>)
}

export interface MiningParameters {
  minPatternLength: number
  maxPatternLength: number
  maxPatternsPerPartition: number
  closedPatterns: boolean
}

export interface FrequencyParameters {
  minAbsoluteFrequency: number
  minModelFrequency: number
}
