import { getMessage } from '@cm2ml/utils'
import { describe, expect, it } from 'vitest'

import { ExecutionError, catching, trying } from '../src/error'

import { add, passthrough, throwingPlugin } from './plugins.test'

const withTrying = trying(throwingPlugin)

const testError = new ExecutionError('test error', 'external')

describe('error', () => {
  describe('trying', () => {
    it('should return results', () => {
      const addWithTrying = trying(add)
      const result = addWithTrying.validateAndInvoke(2, { summand: 1 })
      expect(result).toBe(3)
    })

    it('should pass through previous errors', () => {
      const passthroughWithTrying = trying(passthrough)
      const result = passthroughWithTrying.validateAndInvoke(testError, {})
      expect(result).toBe(testError)
    })

    it('should catch errors', () => {
      const result = withTrying.validateAndInvoke(undefined, {})
      expect(result).toBeInstanceOf(ExecutionError)
      expect(getMessage(result)).toBe('This plugin always throws.')
    })
  })

  describe('catching', () => {
    it('should return non-error input', () => {
      const result = catching<string>().invoke('hello world', { continueOnError: false }, undefined)
      expect(result).toBe('hello world')
    })

    it('should throw errors', () => {
      expect(() => catching<string>().invoke(testError, { continueOnError: false }, undefined)).toThrow(testError)
    })

    it('should catch errors if enabled', () => {
      const result = catching<string>().invoke(testError, { continueOnError: true }, undefined)
      expect(result).toBe(testError)
    })
  })
})
