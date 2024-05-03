import { describe, expect, it } from 'vitest'

import { BooleanEncoder, CategoryEncoder, FloatEncoder, IntegerEncoder, StringEncoder } from './encoder'

describe('feature encoders', () => {
  describe('for categories', () => {
    it('encodes categorical features', () => {
      const encoder = new CategoryEncoder()
      encoder.fit('a')
      encoder.fit('b')
      encoder.fit(null)
      expect(encoder.transform(null)).toBe(0)
      expect(encoder.transform('a')).toBe(1)
      expect(encoder.transform('b')).toBe(2)
    })

    it('can fit the same value multiple times', () => {
      const encoder = new CategoryEncoder()
      encoder.fit('a')
      encoder.fit('a')
      encoder.fit('b')
      expect(encoder.transform('a')).toBe(1)
      expect(encoder.transform('b')).toBe(2)
    })

    it('can export and import state', () => {
      const encoder = new CategoryEncoder()
      encoder.fit('a')
      encoder.fit('b')
      encoder.fit(null)
      const state = encoder.export()
      const newEncoder = new CategoryEncoder()
      newEncoder.import(state)
      expect(newEncoder.transform(null)).toBe(0)
      expect(newEncoder.transform('a')).toBe(1)
      expect(newEncoder.transform('b')).toBe(2)
    })
  })

  describe('for booleans', () => {
    it('encodes boolean features', () => {
      const encoder = new BooleanEncoder()
      expect(encoder.transform(null)).toBe(0)
      expect(encoder.transform('true')).toBe(1)
      expect(encoder.transform('false')).toBe(0)
    })
  })

  describe('for integers', () => {
    it('encodes integer features', () => {
      const encoder = new IntegerEncoder()
      expect(encoder.transform(null)).toBe(0)
      expect(encoder.transform('1')).toBe(1)
      expect(encoder.transform('2')).toBe(2)
    })

    it('treats non-integer values as missing', () => {
      const encoder = new IntegerEncoder()
      expect(encoder.transform(null)).toBe(0)
      expect(encoder.transform('a')).toBe(0)
      expect(encoder.transform('')).toBe(0)
      expect(encoder.transform('true')).toBe(0)
      expect(encoder.transform('*')).toBe(0)
    })
  })

  describe('for floats', () => {
    it('encodes float features', () => {
      const encoder = new FloatEncoder()
      expect(encoder.transform(null)).toBe(0)
      expect(encoder.transform('1.1')).toBe(1.1)
      expect(encoder.transform('2.2')).toBe(2.2)
      expect(encoder.transform('3')).toBe(3)
    })

    it('treats non-float values as missing', () => {
      const encoder = new IntegerEncoder()
      expect(encoder.transform(null)).toBe(0)
      expect(encoder.transform('a')).toBe(0)
      expect(encoder.transform('')).toBe(0)
      expect(encoder.transform('true')).toBe(0)
      expect(encoder.transform('*')).toBe(0)
    })
  })

  describe('for strings', () => {
    it('encodes string features', () => {
      const encoder = new StringEncoder()
      encoder.fit('a')
      encoder.fit('b')
      encoder.fit(null)
      expect(encoder.transform(null)).toBe(0)
      expect(encoder.transform('a')).toBe(1)
      expect(encoder.transform('b')).toBe(2)
    })

    it('can fit the same value multiple times', () => {
      const encoder = new StringEncoder()
      encoder.fit('a')
      encoder.fit('a')
      encoder.fit('b')
      expect(encoder.transform('a')).toBe(1)
      expect(encoder.transform('b')).toBe(2)
    })

    it('can export and import state', () => {
      const encoder = new StringEncoder()
      encoder.fit('a')
      encoder.fit('b')
      encoder.fit(null)
      const state = encoder.export()
      const newEncoder = new StringEncoder()
      newEncoder.import(state)
      expect(newEncoder.transform(null)).toBe(0)
      expect(newEncoder.transform('a')).toBe(1)
      expect(newEncoder.transform('b')).toBe(2)
    })
  })
})
