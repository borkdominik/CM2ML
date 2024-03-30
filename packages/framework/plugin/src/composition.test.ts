import { describe, expect, it } from 'vitest'

import { batch, batchTryCatch, compose } from './composition'
import { PluginExecutionError } from './error'
import { add, throwIfEven } from './plugins.test'

describe('composition', () => {
  describe('compose', () => {
    it('can compose two plugins', () => {
      const composed = compose(add, add)

      const result = composed.invoke(0, { summand: 21 }, undefined)
      expect(result).toBe(42)
    })
  })

  describe('batch', () => {
    it('can batch a plugin', () => {
      const batched = batch(add)

      const result = batched.invoke([1, 10, 100], { summand: 1 }, undefined)
      expect(result).toEqual([2, 11, 101])
    })

    it('throws errors of individual execution', () => {
      const batched = batch(throwIfEven)
      expect(() => batched.invoke([1, 2, 3], {}, undefined)).toThrow('Input is even.')
    })
  })

  describe('batchTryCatch', () => {
    it('throws errors of individual execution', () => {
      const batched = batchTryCatch(throwIfEven)

      expect(() => batched.invoke([1, 2, 3], { continueOnError: false }, undefined)).toThrow('Input is even.')
    })

    it('catches errors of individual execution if enabled', () => {
      const batched = batchTryCatch(throwIfEven)

      const result = batched.invoke([1, 2, 3], { continueOnError: true }, undefined)
      expect(result).toEqual([1, new PluginExecutionError('Input is even.', 'throwIfEven'), 3])
    })
  })
})
