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
  batchMetadataCollector: (batch: number[]) => {
    return { sum: sum(batch), intermediateResults: batch }
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
  batchMetadataCollector: (batch: number[]) => {
    return { sum: sum(batch), intermediateResults: batch }
  },
  invoke: (input: number, parameters, batchMetadata) => ({ result: input ** parameters.exponent, batchMetadata }),
})

export const throwingPlugin = definePlugin({
  name: 'throwing',
  parameters: {},
  invoke: () => {
    throw new Error('This plugin always throws.')
  },
})

export const passthrough = definePlugin({
  name: 'passthrough',
  parameters: {},
  invoke: (input) => input,
})

export const throwIfEven = definePlugin({
  name: 'throwIfEven',
  parameters: {},
  invoke: (input: number) => {
    if (input % 2 === 0) {
      throw new Error('Input is even.')
    }
    return input
  },
})

describe('plugins', () => {
  it('can be defined', () => {
    expect(multiply.name).toBe('first')
    expect(multiply.validateAndInvoke(2, { factor: 3 })).toBe(6)

    expect(add.name).toBe('second')
    expect(add.validateAndInvoke(2, { summand: 3 })).toBe(5)

    expect(power.name).toBe('third')
    expect(power.validateAndInvoke(2, { exponent: 3 })).toMatchObject({ result: 8 })

    expect(throwingPlugin.name).toBe('throwing')
    expect(() => throwingPlugin.validateAndInvoke(undefined, {})).toThrowError('This plugin always throws.')

    expect(passthrough.name).toBe('passthrough')
    expect(passthrough.validateAndInvoke(42, {})).toBe(42)
  })
})
