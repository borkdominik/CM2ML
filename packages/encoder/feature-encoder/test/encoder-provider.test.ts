import { describe, expect, it } from 'vitest'

import { BooleanEncoder, CategoryEncoder, FeatureEncoderProvider, FloatEncoder, IntegerEncoder, StringEncoder } from '../src/encoder'

describe('encoder provider', () => {
  it('provides the correct encoder', () => {
    const provider = new FeatureEncoderProvider({
      rawFeatures: false,
      rawCategories: false,
      rawBooleans: false,
      rawNumerics: false,
      rawStrings: false,
    })
    expect(provider.getOrCreateEncoder('a', 'category')).toBeInstanceOf(CategoryEncoder)
    expect(provider.getOrCreateEncoder('a', 'boolean')).toBeInstanceOf(BooleanEncoder)
    expect(provider.getOrCreateEncoder('a', 'integer')).toBeInstanceOf(IntegerEncoder)
    expect(provider.getOrCreateEncoder('a', 'float')).toBeInstanceOf(FloatEncoder)
    expect(provider.getOrCreateEncoder('a', 'string')).toBeInstanceOf(StringEncoder)
    expect(provider.getOrCreateEncoder('a', 'unknown')).toBeUndefined()
  })

  it('provides unique encoders for different features', () => {
    const provider = new FeatureEncoderProvider({
      rawFeatures: false,
      rawCategories: false,
      rawBooleans: false,
      rawNumerics: false,
      rawStrings: false,
    })
    const encoder1 = provider.getOrCreateEncoder('a', 'category')
    const encoder2 = provider.getOrCreateEncoder('b', 'category')
    expect(encoder1).not.toBe(encoder2)
  })

  it('provides the same encoder for the same feature', () => {
    const provider = new FeatureEncoderProvider({
      rawFeatures: false,
      rawCategories: false,
      rawBooleans: false,
      rawNumerics: false,
      rawStrings: false,
    })
    const encoder1 = provider.getOrCreateEncoder('a', 'category')
    const encoder2 = provider.getOrCreateEncoder('a', 'category')
    expect(encoder1).toBe(encoder2)
  })

  describe('settings', () => {
    it('does not provide encoders for raw features', () => {
      const provider = new FeatureEncoderProvider({
        rawFeatures: true,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: false,
      })
      expect(provider.getOrCreateEncoder('a', 'category')).toBeUndefined()
      expect(provider.getOrCreateEncoder('a', 'boolean')).toBeUndefined()
      expect(provider.getOrCreateEncoder('a', 'integer')).toBeUndefined()
      expect(provider.getOrCreateEncoder('a', 'float')).toBeUndefined()
      expect(provider.getOrCreateEncoder('a', 'string')).toBeUndefined()
    })

    it('does not provide encoders for raw categories', () => {
      const provider = new FeatureEncoderProvider({
        rawFeatures: false,
        rawCategories: true,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: false,
      })
      expect(provider.getOrCreateEncoder('a', 'category')).toBeUndefined()
    })

    it('does not provide encoders for raw booleans', () => {
      const provider = new FeatureEncoderProvider({
        rawFeatures: false,
        rawCategories: false,
        rawBooleans: true,
        rawNumerics: false,
        rawStrings: false,
      })
      expect(provider.getOrCreateEncoder('a', 'boolean')).toBeUndefined()
    })

    it('does not provide encoders for raw numerics', () => {
      const provider = new FeatureEncoderProvider({
        rawFeatures: false,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: true,
        rawStrings: false,
      })
      expect(provider.getOrCreateEncoder('a', 'integer')).toBeUndefined()
      expect(provider.getOrCreateEncoder('a', 'float')).toBeUndefined()
    })

    it('does not provide encoders for raw strings', () => {
      const provider = new FeatureEncoderProvider({
        rawFeatures: false,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: true,
      })
      expect(provider.getOrCreateEncoder('a', 'string')).toBeUndefined()
    })
  })
})
