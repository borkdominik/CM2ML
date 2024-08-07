import { describe, expect, it } from 'vitest'

import { collectPaths } from '../src/paths'

import { createTestModel } from './test-utils'

describe('paths', () => {
  it('does not include duplicates', () => {
    expect(1).toBe(1)
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'a'], ['a', 'c'], ['b', 'c']])
    const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3 })
    expect(paths).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          3,
        ],
        [
          1,
          3,
        ],
        [
          2,
          1,
          3,
        ],
        [
          2,
          3,
        ],
      ]
    `)
  })
})
