import type { FeatureName, RawFeatureType } from './features'

export interface Encoder {
  fit: (value: string | null) => void
  transform: (value: string | null) => number
}

export interface EncoderProviderSettings {
  rawFeatures: boolean
  rawCategories: boolean
  rawBooleans: boolean
  rawStrings: boolean
  rawNumerics: boolean
}

export class EncoderProvider {
  private readonly encoders = new Map<string, Encoder>()

  public constructor(
    private readonly settings: EncoderProviderSettings,
  ) {}

  public getEncoder(name: FeatureName, type: RawFeatureType): Encoder | undefined {
    if (this.settings.rawFeatures) {
      return undefined
    }
    const key = `${name}:${type}`
    const encoder = this.encoders.get(key)
    if (encoder) {
      return encoder
    }
    const newEncoder = this.createEncoder(type)
    if (!newEncoder) {
      return undefined
    }
    this.encoders.set(key, newEncoder)
    return newEncoder
  }

  private createEncoder(type: RawFeatureType): Encoder | undefined {
    if (type === 'category' && !this.settings.rawCategories) {
      return new CategoryEncoder()
    }
    if (type === 'boolean' && !this.settings.rawBooleans) {
      return new BooleanEncoder()
    }
    if (type === 'integer' && !this.settings.rawNumerics) {
      return new IntegerEncoder()
    }
    if (type === 'float' && !this.settings.rawNumerics) {
      return new FloatEncoder()
    }
    if (type === 'string' && !this.settings.rawStrings) {
      return new StringEncoder()
    }
    if (type === 'unknown') {
      return undefined
    }
    return undefined
  }
}

export class CategoryEncoder implements Encoder {
  private readonly categories = new Map<string, number>()

  public fit(category: string | null) {
    if (category === null) {
      return
    }
    if (!this.categories.has(category)) {
      this.categories.set(category, this.categories.size)
    }
  }

  public transform(category: string | null) {
    if (category === null) {
      return 0
    }
    const index = this.categories.get(category)
    if (index === undefined) {
      throw new Error(`Unknown category: ${category}`)
    }
    return index + 1
  }
}

export class BooleanEncoder implements Encoder {
  public fit(_value: string | null) {
  }

  public transform(value: string | null) {
    return value === 'true' ? 1 : 0
  }
}

export class IntegerEncoder implements Encoder {
  private minimum = Number.MAX_SAFE_INTEGER
  private maximum = Number.MIN_SAFE_INTEGER

  public fit(value: string | null) {
    if (value === null || value === '') {
      return
    }
    if (value === '*') {
      return // ignore wildcard
    }
    const number = parseInt(value, 10)
    if (isNaN(number)) {
      throw new TypeError(`Invalid integer: ${value}`)
    }
    this.minimum = Math.min(this.minimum, number)
    this.maximum = Math.max(this.maximum, number)
  }

  public transform(value: string | null) {
    if (value === null || value === '') {
      return 0
    }
    if (value === '*') {
      return this.maximum
    }
    const number = parseInt(value, 10)
    if (isNaN(number)) {
      throw new TypeError(`Invalid integer: ${value}`)
    }
    return (number - this.minimum) / (this.maximum - this.minimum)
  }
}

export class FloatEncoder implements Encoder {
  private minimum = Number.MAX_VALUE
  private maximum = Number.MIN_VALUE

  public fit(value: string | null) {
    if (value === null) {
      return
    }
    const number = parseFloat(value)
    if (isNaN(number)) {
      throw new TypeError(`Invalid float: ${value}`)
    }
    this.minimum = Math.min(this.minimum, number)
    this.maximum = Math.max(this.maximum, number)
  }

  public transform(value: string | null) {
    if (value === null) {
      return 0
    }
    const number = parseFloat(value)
    if (isNaN(number)) {
      throw new TypeError(`Invalid float: ${value}`)
    }
    return (number - this.minimum) / (this.maximum - this.minimum)
  }
}

export class StringEncoder extends CategoryEncoder {}
