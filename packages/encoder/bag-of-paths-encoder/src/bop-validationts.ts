import type { PathParameters } from './bop-types'

export function validatePathParameters(parameters: PathParameters) {
  if (parameters.minPathLength < 0) {
    throw new Error('Minimum path length must be at least 0')
  }
  if (parameters.maxPathLength < 0) {
    throw new Error('Maximum path length must be at least 0')
  }
  if (parameters.maxPathLength < parameters.minPathLength) {
    throw new Error('Maximum path length must be greater than or equal to minimum path length')
  }
}
