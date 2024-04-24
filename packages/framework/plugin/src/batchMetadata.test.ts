import { describe, expect, it } from 'vitest'

import { batchedCompose, compose } from './composition'
import { add, multiply, power } from './plugins.test'

describe('batch metadata', () => {
  it('can passed between non-batched plugins', () => {
    const composed = compose(multiply, compose(add, power))

    const result = composed.validateAndInvoke(1, { factor: 2, summand: 1, exponent: 2 })
    expect(result).toMatchInlineSnapshot(`
      {
        "batchMetadata": {
          "intermediateResults": [
            3,
          ],
          "sum": 3,
        },
        "result": 9,
      }
    `)
  })

  it('can passed between batched plugins', () => {
    const composed = batchedCompose((multiply), compose(add, power))

    const result = composed.validateAndInvoke([1, 10], { continueOnError: false, factor: 2, summand: 1, exponent: 2 })
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "batchMetadata": {
            "intermediateResults": [
              3,
            ],
            "sum": 3,
          },
          "result": 9,
        },
        {
          "batchMetadata": {
            "intermediateResults": [
              21,
            ],
            "sum": 21,
          },
          "result": 441,
        },
      ]
    `)
  })
})
