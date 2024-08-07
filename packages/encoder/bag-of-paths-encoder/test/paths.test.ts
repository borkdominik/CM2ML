import { describe, expect, it } from 'vitest'

import { collectPaths } from '../src/paths'

import { createTestModel } from './test-utils'

describe('paths', () => {
  it('does not include duplicates', () => {
    expect(1).toBe(1)
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b']])
    const paths = collectPaths(model, { minPathLength: 1, maxPathLength: 3, weight: 'edge-count', weightReduction: 'none' })
    expect(paths).toMatchInlineSnapshot(`
      [
        {
          "path": [
            1,
            2,
          ],
          "weight": [
            2,
          ],
        },
      ]
    `)
  })

  describe('weighting', () => {
    it('can use no reduction', () => {
      expect(1).toBe(1)
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3, weight: 'edge-count', weightReduction: 'none' })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "path": [
              1,
              2,
              3,
            ],
            "weight": [
              2,
              1,
            ],
          },
        ]
      `)
    })

    it('can use length reduction', () => {
      expect(1).toBe(1)
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3, weight: 'edge-count', weightReduction: 'length' })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "path": [
              1,
              2,
              3,
            ],
            "weight": 2,
          },
        ]
      `)
    })

    it('can use product reduction', () => {
      expect(1).toBe(1)
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c'], ['b', 'c']])
      const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3, weight: 'edge-count', weightReduction: 'product' })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "path": [
              1,
              2,
              3,
            ],
            "weight": 4,
          },
        ]
      `)
    })

    it('can use sum reduction', () => {
      expect(1).toBe(1)
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3, weight: 'edge-count', weightReduction: 'sum' })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "path": [
              1,
              2,
              3,
            ],
            "weight": 3,
          },
        ]
      `)
    })
  })
})
