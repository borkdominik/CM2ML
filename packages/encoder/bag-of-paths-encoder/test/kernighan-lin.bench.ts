import { bench } from 'vitest'

import { kernighanLin } from '../src/kernighan-lin'

import { createTestModel } from './test-utils'

const nodeIds = [
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
]

const edges = nodeIds.flatMap((source, i) => {
  const t1 = nodeIds[(i + Math.floor(nodeIds.length / 3)) % nodeIds.length]!
  const t2 = nodeIds[(i + Math.floor(2 * nodeIds.length / 3)) % nodeIds.length]!
  const t3 = nodeIds[(i + Math.floor(nodeIds.length)) % nodeIds.length]!
  return [[source, t1], [t1, source], [source, t2], [t2, source], [source, t3], [t3, source]] as const
})

const model = createTestModel(nodeIds, edges)

const nodes = Array.from(model.nodes)

bench('kernighan-lin algorithm', () => {
  kernighanLin(nodes, { maxIterations: 1000 })
}, { iterations: 50, warmupIterations: 20, warmupTime: 2000 })
