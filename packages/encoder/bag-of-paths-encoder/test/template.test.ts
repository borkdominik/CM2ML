import { describe, expect, it } from 'vitest'

import { getSegments } from '../src/template'

describe('mapper', () => {
  it('can parse a template', () => {
    const result = getSegments('{a}{b}')
    expect(result).toEqual(['a', 'b'])
  })
})
