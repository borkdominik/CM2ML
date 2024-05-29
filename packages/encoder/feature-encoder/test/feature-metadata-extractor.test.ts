import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { getFeatureMetadataFromFile } from '../src/feature-metadata-extractor'

import fixture from './fixture.json'

describe('cli formatter action handler', () => {
  it('formats feature metadata', () => {
    const fileContent = readFileSync('test/fixture.json', 'utf8')
    const result = getFeatureMetadataFromFile(fileContent, 'nodeFeatures')
    expect(result).toEqual(JSON.stringify(fixture.__metadata__.nodeFeatures))
  })
})
