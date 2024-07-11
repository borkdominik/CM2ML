export interface BoPParameters {
  maxIterations: number
  maxPartitionSize: number
  costType: 'edge-count' | 'constant' | (string & Record<never, never>)
  minPatternLength: number
  maxPatternLength: number
  maxPatterns: number
  closedPatterns: boolean
}
