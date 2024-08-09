import { describe, expect, it } from 'vitest'

import { collectPaths } from '../src/paths'

import { createTestModel } from './test-utils'

describe('paths', () => {
  it('does not include duplicates', () => {
    expect(1).toBe(1)
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
    const paths = collectPaths(model, { minPathLength: 1, maxPathLength: 3, stepWeight: 'edge-count', pathWeight: 'length', maxPaths: -1 })
    expect(paths).toMatchInlineSnapshot(`
      [
        {
          "stepWeights": [
            2,
            1,
          ],
          "steps": [
            1,
            2,
            3,
          ],
          "weight": 2,
        },
        {
          "stepWeights": [
            1,
          ],
          "steps": [
            2,
            3,
          ],
          "weight": 1,
        },
      ]
    `)
  })

  it('can limit the number of paths', () => {
    expect(1).toBe(1)
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
    const paths = collectPaths(model, { minPathLength: 1, maxPathLength: 3, stepWeight: 'edge-count', pathWeight: 'length', maxPaths: 1 })
    expect(paths).toMatchInlineSnapshot(`
      [
        {
          "stepWeights": [
            2,
            1,
          ],
          "steps": [
            1,
            2,
            3,
          ],
          "weight": 2,
        },
      ]
    `)
  })

  describe('weighting', () => {
    it('can use length weighting', () => {
      expect(1).toBe(1)
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3, stepWeight: 'edge-count', pathWeight: 'length', maxPaths: -1 })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "stepWeights": [
              2,
              1,
            ],
            "steps": [
              1,
              2,
              3,
            ],
            "weight": 2,
          },
        ]
      `)
    })

    it('can use step-product weighting', () => {
      expect(1).toBe(1)
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c'], ['b', 'c']])
      const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3, stepWeight: 'edge-count', pathWeight: 'step-product', maxPaths: -1 })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "stepWeights": [
              2,
              2,
            ],
            "steps": [
              1,
              2,
              3,
            ],
            "weight": 4,
          },
        ]
      `)
    })

    it('can use step-sum weighting', () => {
      expect(1).toBe(1)
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, { minPathLength: 2, maxPathLength: 3, stepWeight: 'edge-count', pathWeight: 'step-sum', maxPaths: -1 })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "stepWeights": [
              2,
              1,
            ],
            "steps": [
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
