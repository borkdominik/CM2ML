import { describe, expect, it } from 'vitest'

import { getFeatureMetadataFromFile } from '../src/feature-metadata-extractor'

import fixture from './fixture.json'

describe('cli formatter action handler', () => {
  it('formats feature metadata', () => {
    const result = getFeatureMetadataFromFile(`${import.meta.dirname}/fixture.json`, '__metadata__.nodeFeatures')
    expect(result).toEqual(JSON.stringify(fixture.__metadata__.nodeFeatures))
  })
})
