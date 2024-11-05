import { bench } from 'vitest'

import { kernighanLin } from '../src'

import { createTestGraph, getConnectedVertices } from './test-utils'

const vertexIds = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
].flatMap((id) => Array.from({ length: 10 }).map((_, i) => id.repeat(i + 1)))

const edges = vertexIds.flatMap((source, i) => {
  const t1 = vertexIds[(i + Math.floor(vertexIds.length / 3)) % vertexIds.length]!
  const t2 = vertexIds[(i + Math.floor(2 * vertexIds.length / 3)) % vertexIds.length]!
  const t3 = vertexIds[(i + Math.floor(vertexIds.length)) % vertexIds.length]!
  return [[source, t1], [t1, source], [source, t2], [t2, source], [source, t3], [t3, source]] as const
})

const vertices = createTestGraph(vertexIds, edges)

bench('kernighan-lin algorithm', () => {
  kernighanLin(vertices, getConnectedVertices, { maxIterations: -1 })
}, { iterations: 10, warmupIterations: 5 })
