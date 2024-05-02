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
  ) { }

  /**
   * Check if a given type can (and will) be encoded by this provider.
   * The result depends on the {@link settings} of the provider.
   */
  public canEncode(type: RawFeatureType): boolean {
    if (this.settings.rawFeatures) {
      return false
    }
    if (type === 'category') {
      return !this.settings.rawCategories
    }
    if (type === 'boolean') {
      return !this.settings.rawBooleans
    }
    if (type === 'integer' || type === 'float') {
      return !this.settings.rawNumerics
    }
    if (type === 'string') {
      return !this.settings.rawStrings
    }
    return false
  }

  /**
   * Get the encoder for a given feature name and type.
   * If the encoder does not exist yet, it will be created once.
   * If the type cannot be encoded, this method returns undefined.
   */
  public getEncoder(name: FeatureName, type: RawFeatureType): Encoder | undefined {
    if (!this.canEncode(type)) {
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
    if (type === 'category') {
      return new CategoryEncoder()
    }
    if (type === 'boolean') {
      return new BooleanEncoder()
    }
    if (type === 'integer') {
      return new IntegerEncoder()
    }
    if (type === 'float') {
      return new FloatEncoder()
    }
    if (type === 'string') {
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
    if (value === null) {
      return
    }
    const number = parseInt(value, 10)
    if (isNaN(number)) {
      return
    }
    this.minimum = Math.min(this.minimum, number)
    this.maximum = Math.max(this.maximum, number)
  }

  public transform(value: string | null) {
    if (value === null) {
      return 0
    }
    const number = parseInt(value, 10)
    if (isNaN(number)) {
      return 0
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
      return
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
      return 0
    }
    return (number - this.minimum) / (this.maximum - this.minimum)
  }
}

export class StringEncoder extends CategoryEncoder {}
