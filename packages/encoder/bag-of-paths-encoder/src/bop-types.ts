export const pathWeightTypes = ['step-sum', 'length', 'step-product'] as const

export type PathWeight = typeof pathWeightTypes[number] | string & Record<never, never>

export const sortOrders = ['asc', 'desc'] as const

export type SortOrder = typeof sortOrders[number] | string & Record<never, never>

export interface PathParameters {
  minPathLength: number
  maxPathLength: number
  pathWeight: PathWeight
  maxPaths: number
  allowCycles: boolean
  order: SortOrder
  stepWeighting: readonly string[]
}

export interface BoPEncodingParameters {
  nodeTemplates: readonly string[]
  edgeTemplates: readonly string[]
}
