import { describe, expect, it } from 'vitest'

import { BooleanEncoder, CategoryEncoder, EncoderProvider, FloatEncoder, IntegerEncoder, StringEncoder } from './encoder'

describe('encoder provider', () => {
  it('provides the correct encoder', () => {
    const provider = new EncoderProvider({
      rawFeatures: false,
      rawCategories: false,
      rawBooleans: false,
      rawNumerics: false,
      rawStrings: false,
    })
    expect(provider.getEncoder('a', 'category')).toBeInstanceOf(CategoryEncoder)
    expect(provider.getEncoder('a', 'boolean')).toBeInstanceOf(BooleanEncoder)
    expect(provider.getEncoder('a', 'integer')).toBeInstanceOf(IntegerEncoder)
    expect(provider.getEncoder('a', 'float')).toBeInstanceOf(FloatEncoder)
    expect(provider.getEncoder('a', 'string')).toBeInstanceOf(StringEncoder)
    expect(provider.getEncoder('a', 'unknown')).toBeUndefined()
  })

  it('provides unique encoders for different features', () => {
    const provider = new EncoderProvider({
      rawFeatures: false,
      rawCategories: false,
      rawBooleans: false,
      rawNumerics: false,
      rawStrings: false,
    })
    const encoder1 = provider.getEncoder('a', 'category')
    const encoder2 = provider.getEncoder('b', 'category')
    expect(encoder1).not.toBe(encoder2)
  })

  it('provides the same encoder for the same feature', () => {
    const provider = new EncoderProvider({
      rawFeatures: false,
      rawCategories: false,
      rawBooleans: false,
      rawNumerics: false,
      rawStrings: false,
    })
    const encoder1 = provider.getEncoder('a', 'category')
    const encoder2 = provider.getEncoder('a', 'category')
    expect(encoder1).toBe(encoder2)
  })

  describe('settings', () => {
    it('does not provide encoders for raw features', () => {
      const provider = new EncoderProvider({
        rawFeatures: true,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: false,
      })
      expect(provider.getEncoder('a', 'category')).toBeUndefined()
      expect(provider.getEncoder('a', 'boolean')).toBeUndefined()
      expect(provider.getEncoder('a', 'integer')).toBeUndefined()
      expect(provider.getEncoder('a', 'float')).toBeUndefined()
      expect(provider.getEncoder('a', 'string')).toBeUndefined()
    })

    it('does not provide encoders for raw categories', () => {
      const provider = new EncoderProvider({
        rawFeatures: false,
        rawCategories: true,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: false,
      })
      expect(provider.getEncoder('a', 'category')).toBeUndefined()
    })

    it('does not provide encoders for raw booleans', () => {
      const provider = new EncoderProvider({
        rawFeatures: false,
        rawCategories: false,
        rawBooleans: true,
        rawNumerics: false,
        rawStrings: false,
      })
      expect(provider.getEncoder('a', 'boolean')).toBeUndefined()
    })

    it('does not provide encoders for raw numerics', () => {
      const provider = new EncoderProvider({
        rawFeatures: false,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: true,
        rawStrings: false,
      })
      expect(provider.getEncoder('a', 'integer')).toBeUndefined()
      expect(provider.getEncoder('a', 'float')).toBeUndefined()
    })

    it('does not provide encoders for raw strings', () => {
      const provider = new EncoderProvider({
        rawFeatures: false,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: true,
      })
      expect(provider.getEncoder('a', 'string')).toBeUndefined()
    })
  })
})
