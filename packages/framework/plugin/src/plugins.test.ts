import { describe, expect, it } from 'vitest'

import { definePlugin } from './plugin'

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0)
}

export interface TestBatchMetadata {
  sum: number
  intermediateResults: number[]
}

export const multiply = definePlugin({
  name: 'first',
  parameters: {
    factor: { type: 'number', description: 'A factor', defaultValue: 1 },
  },
  invoke: (input: number, parameters) => input * parameters.factor,
})

export const add = definePlugin({
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

export const power = definePlugin({
  name: 'third',
  parameters: {
    exponent: { type: 'number', description: 'An exponent', defaultValue: 1 },
  },
  batchMetadataCollector: (intermediateResults: number[], previous: TestBatchMetadata | undefined) => {
    return { firstBatchMetadata: previous, secondBatchMetadata: { sum: sum(intermediateResults), intermediateResults } }
  },
  invoke: (input: number, parameters, batchMetadata) => ({ result: input ** parameters.exponent, batchMetadata }),
})

describe('plugins', () => {
  it('can be defined', () => {
    expect(multiply.name).toBe('first')
    expect(multiply.invoke(2, { factor: 3 }, undefined)).toBe(6)

    expect(add.name).toBe('second')
    expect(add.invoke(2, { summand: 3 }, undefined)).toBe(5)

    expect(power.name).toBe('third')
    expect(power.invoke(2, { exponent: 3 }, undefined)).toMatchObject({ result: 8 })
  })
})
