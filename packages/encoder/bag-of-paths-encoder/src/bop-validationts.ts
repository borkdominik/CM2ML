import type { PathParameters } from './bop-types'

export function validatePathParameters(parameters: PathParameters) {
  if (parameters.minPathLength < 1) {
    throw new Error('Minimum path length must be at least 1')
  }
  if (parameters.maxPathLength < 1) {
    throw new Error('Maximum path length must be at least 1')
  }
  if (parameters.maxPathLength < parameters.minPathLength) {
    throw new Error('Maximum path length must be greater than or equal to minimum path length')
  }
}
