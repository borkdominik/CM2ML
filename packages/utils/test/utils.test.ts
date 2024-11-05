import { describe, expect, it, vi } from 'vitest'

import { getMessage, lazy, parseNamespace } from '../src'

describe('utils', () => {
  describe('getMessage', () => {
    it('gets the message of errors', () => {
      const message = 'HelloWorld'
      const error = new Error(message)
      const output = getMessage(error)
      expect(output).toBe(message)
    })

    it('gets the message of error-like objects', () => {
      const message = 'HelloWorld'
      const error = { message }
      const output = getMessage(error)
      expect(output).toBe(message)
    })

    describe('other values', () => {
      it('stringifies numbers', () => {
        const error = 42
        const output = getMessage(error)
        expect(output).toBe('42')
      })

      it('stringifies boolean', () => {
        const error = true
        const output = getMessage(error)
        expect(output).toBe('true')
      })

      it('stringifies objects', () => {
        const error = { hello: 'world ' }
        const output = getMessage(error)
        expect(output).toBe(JSON.stringify(error))
      })
    })
  })

  describe('parseNamespace', () => {
    it('parses the namespace', () => {
      const input = 'namespace:value'
      const output = parseNamespace(input)
      expect(output).toEqual({ name: 'value', namespace: 'namespace' })
    })

    it('returns the value if no namespace is present', () => {
      const input = 'value'
      expect(parseNamespace(input)).toBe(input)
    })
  })

  describe('lazy', () => {
    it('initializes the value lazily', () => {
      const initializer = vi.fn(() => ({ value: 42 }))
      const output = lazy(initializer)
      expect(initializer).not.toHaveBeenCalled()
      expect(output.value).toBe(42)
      expect(initializer).toHaveBeenCalledTimes(1)
    })

    it('caches the value', () => {
      const initializer = vi.fn(() => ({ value: 42 }))
      const output = lazy(initializer)
      expect(output.value).toBe(42)
      expect(output.value).toBe(42)
      expect(initializer).toHaveBeenCalledTimes(1)
    })

    it('proxies the object', () => {
      const initializer = vi.fn(() => ({ value: 42 }))
      const output = lazy(initializer)
      expect('value' in output).toBe(true)
      expect('missing' in output).toBe(false)
    })
  })
})
