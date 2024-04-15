import { describe, expect, it } from 'vitest'

import { batch, batchTryCatch, compose } from './composition'
import { ExecutionError } from './error'
import { add, throwIfEven } from './plugins.test'

describe('composition', () => {
  describe('compose', () => {
    it('can compose two plugins', () => {
      const composed = compose(add, add)

      const result = composed.validateAndInvoke(0, { summand: 21 })
      expect(result).toBe(42)
    })
  })

  describe('batch', () => {
    it('can batch a plugin', () => {
      const batched = batch(add)

      const result = batched.validateAndInvoke([1, 10, 100], { summand: 1 })
      expect(result).toEqual([2, 11, 101])
    })

    it('throws errors of individual execution', () => {
      const batched = batch(throwIfEven)
      expect(() => batched.validateAndInvoke([1, 2, 3], {})).toThrow('Input is even.')
    })
  })

  describe('batchTryCatch', () => {
    it('throws errors of individual execution', () => {
      const batched = batchTryCatch(throwIfEven)

      expect(() => batched.validateAndInvoke([1, 2, 3], { continueOnError: false })).toThrow('Input is even.')
    })

    it('catches errors of individual execution if enabled', () => {
      const batched = batchTryCatch(throwIfEven)

      const result = batched.validateAndInvoke([1, 2, 3], { continueOnError: true })
      expect(result).toEqual([1, new ExecutionError('Input is even.', 'throwIfEven'), 3])
    })
  })
})
