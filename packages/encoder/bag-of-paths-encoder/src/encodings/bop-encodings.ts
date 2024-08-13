import { Stream } from '@yeger/streams'

import type { PathData } from '../paths'

export const pathEncodings = [
  'path-count',
  'path-weight',
  // 'discounted-path-sum',
] as const

export type PathEncoding = typeof pathEncodings[number]

export interface PathEncodingParameters {
  pathEncoding: readonly (PathEncoding | string & Record<never, never>) []
}

interface PathEncoderContext {
  nodeIndex: number
  paths: Set<PathData>
  parameters: PathEncodingParameters
  longestPathLength: number
}

export function encodePaths(nodeIndex: number, paths: Set<PathData>, parameters: PathEncodingParameters, longestPathLength: number, highestPathCount: number) {
  const context: PathEncoderContext = {
    nodeIndex,
    paths,
    parameters,
    longestPathLength,
  }
  const pathEncodingTypes = new Set(parameters.pathEncoding)

  type PathEncoder<T> = (context: PathEncoderContext) => T

  const ifSelected = <T>(encoding: PathEncoding, encoder: PathEncoder<T>) => pathEncodingTypes.has(encoding) ? encoder : undefined

  const pathEncoderMap = {
    'path-count': ifSelected('path-count', (_context) => {
      return Array.from({ length: longestPathLength }).map((_, length) => {
        return Stream.from(paths).filter((path) => path.steps.length === length + 1).toArray().length
      })
    }),
    'path-weight': ifSelected('path-weight', (_context) => {
      const weights = Stream.from(paths).map((path) => path.weight)
      const padding = Array.from({ length: highestPathCount - paths.size }).map(() => 0)
      return weights.concat(padding).toArray()
    }),
  } as const satisfies Record<PathEncoding, PathEncoder<unknown> | undefined>

  const getEncoded = <T>(encoding: PathEncoder<T> | undefined) => encoding ? encoding(context) : undefined
  return {
    'path-count': getEncoded(pathEncoderMap['path-count']),
    'path-weight': getEncoded(pathEncoderMap['path-weight']),
  } satisfies Record<PathEncoding, unknown>
}
