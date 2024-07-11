export interface PartitioningParameters {
  maxPartitioningIterations: number
  maxPartitionSize: number
  costType: 'edge-count' | 'constant' | (string & Record<never, never>)
}

export interface MiningParameters {
  minPatternLength: number
  maxPatternLength: number
  maxPatterns: number
  closedPatterns: boolean
}
