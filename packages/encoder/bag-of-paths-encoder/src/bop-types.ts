export const weights = ['edge-count'] as const

export type StepWeight = typeof weights[number] | string & Record<never, never>

export const weightReductions = ['none', 'length', 'product', 'sum'] as const

export type WeightReduction = typeof weightReductions[number] | string & Record<never, never>

export interface PathParameters {
  minPathLength: number
  maxPathLength: number
  weight: StepWeight
  weightReduction: WeightReduction
}
