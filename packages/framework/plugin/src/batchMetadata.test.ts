import { describe, expect, it } from 'vitest'

import { batch, compose, definePlugin } from './plugin'

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0)
}

interface TestBatchMetadata {
  sum: number
  intermediateResults: number[]
}

const multiply = definePlugin({
  name: 'first',
  parameters: {
    factor: { type: 'number', description: 'A factor', defaultValue: 1 },
  },
  invoke: (input: number, parameters) => input * parameters.factor,
})

const add = definePlugin({
  name: 'second',
  parameters: {
    summand: { type: 'number', description: 'A summand', defaultValue: 0 },
  },
  batchMetadataCollector: (intermediateResults: number[]) => {
    return { sum: sum(intermediateResults), intermediateResults }
  },
  invoke: (input: number, parameters) => {
    return input + parameters.summand
  },
})

const power = definePlugin({
  name: 'third',
  parameters: {
    exponent: { type: 'number', description: 'An exponent', defaultValue: 1 },
  },
  batchMetadataCollector: (intermediateResults: number[], previous: TestBatchMetadata | undefined) => {
    return { firstBatchMetadata: previous, secondBatchMetadata: { sum: sum(intermediateResults), intermediateResults } }
  },
  invoke: (input: number, parameters, batchMetadata) => ({ result: input ** parameters.exponent, batchMetadata }),
})

describe('batch metadata', () => {
  it('can passed between non-batched plugins', () => {
    const composed = compose(multiply, compose(add, power))

    const result = composed.invoke(1, { factor: 2, summand: 1, exponent: 2 }, undefined)
    expect(result).toMatchInlineSnapshot(`
      {
        "batchMetadata": {
          "firstBatchMetadata": {
            "intermediateResults": [
              2,
            ],
            "sum": 2,
          },
          "secondBatchMetadata": {
            "intermediateResults": [
              3,
            ],
            "sum": 3,
          },
        },
        "result": 9,
      }
    `)
  })

  it('can passed between batched plugins', () => {
    const composed = batch(multiply, compose(add, power))

    const result = composed.invoke([1, 10], { factor: 2, summand: 1, exponent: 2 }, undefined)
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "batchMetadata": {
            "firstBatchMetadata": {
              "intermediateResults": [
                2,
                20,
              ],
              "sum": 22,
            },
            "secondBatchMetadata": {
              "intermediateResults": [
                3,
              ],
              "sum": 3,
            },
          },
          "result": 9,
        },
        {
          "batchMetadata": {
            "firstBatchMetadata": {
              "intermediateResults": [
                2,
                20,
              ],
              "sum": 22,
            },
            "secondBatchMetadata": {
              "intermediateResults": [
                21,
              ],
              "sum": 21,
            },
          },
          "result": 441,
        },
      ]
    `)
  })
})
