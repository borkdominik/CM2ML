export const stepWeightTypes = ['edge-count'] as const

export type StepWeight = typeof stepWeightTypes[number] | string & Record<never, never>

export const pathWeightTypes = ['length', 'step-product', 'step-sum'] as const

export type PathWeight = typeof pathWeightTypes[number] | string & Record<never, never>

export const sortOrders = ['asc', 'desc'] as const

export type SortOrder = typeof sortOrders[number] | string & Record<never, never>

export interface PathParameters {
  minPathLength: number
  maxPathLength: number
  stepWeight: StepWeight
  pathWeight: PathWeight
  maxPaths: number
  allowCycles: boolean
  includeSubpaths: boolean
  order: SortOrder
}
