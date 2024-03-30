import { getMessage } from '@cm2ml/utils'
import { describe, expect, it } from 'vitest'

import { PluginExecutionError, catching, trying } from './error'
import { add, passthrough, throwingPlugin } from './plugins.test'

const withTrying = trying(throwingPlugin)

const testError = new PluginExecutionError('test error', 'external')

describe('error', () => {
  describe('trying', () => {
    it('should return results', () => {
      const addWithTrying = trying(add)
      const result = addWithTrying.invoke(2, { summand: 1 }, undefined)
      expect(result).toBe(3)
    })

    it('should pass through previous errors', () => {
      const passthroughWithTrying = trying(passthrough)
      const result = passthroughWithTrying.invoke(testError, {}, undefined)
      expect(result).toBe(testError)
    })

    it('should catch errors', () => {
      const result = withTrying.invoke(undefined, {}, undefined)
      expect(result).toBeInstanceOf(PluginExecutionError)
      expect(getMessage(result)).toBe('This plugin always throws.')
    })
  })

  describe('catching', () => {
    it('should return non-error input', () => {
      const result = catching<string, unknown>().invoke('hello world', { continueOnError: false }, undefined)
      expect(result).toBe('hello world')
    })

    it('should throw errors', () => {
      expect(() => catching<string, unknown>().invoke(testError, { continueOnError: false }, undefined)).toThrow(testError)
    })

    it('should catch errors if enabled', () => {
      const result = catching<string, unknown>().invoke(testError, { continueOnError: true }, undefined)
      expect(result).toBe(testError)
    })
  })
})
