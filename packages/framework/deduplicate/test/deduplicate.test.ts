import { describe, expect, it } from 'vitest'

import { deduplicate, DUPLICATE_SYMBOL } from '../src'

describe('deduplicate', () => {
  it('can deduplicate a batch', () => {
    const batch = ['a', 'b', 'a', 'c', 'c']
    const input = { data: batch, metadata: {} }
    const output = deduplicate().invoke(input, { deduplicate: true, deduplicationData: [''] })
    expect(output.data).toEqual(['a', 'b', DUPLICATE_SYMBOL, 'c', DUPLICATE_SYMBOL])
  })

  it('can be disabled', () => {
    const batch = ['a', 'b', 'a', 'c', 'c']
    const input = { data: batch, metadata: {} }
    const output = deduplicate().invoke(input, { deduplicate: false, deduplicationData: [''] })
    expect(output.data).toEqual(batch)
  })

  it('can use additional data', () => {
    const batch = ['a', 'b', 'a', 'c', 'd', 'e', 'f', 'g']
    const input = { data: batch, metadata: {} }

    const deduplicationData = [
      { data: ['c'] }, // structured output format
      ['e'], // simple array format
      { data: { 'some-key': 'f', 'another-key': 'g' } }, // CLI output format
    ].map((data) => JSON.stringify(data))
    const output = deduplicate().invoke(input, { deduplicate: true, deduplicationData })
    expect(output.data).toEqual(['a', 'b', DUPLICATE_SYMBOL, DUPLICATE_SYMBOL, 'd', DUPLICATE_SYMBOL, DUPLICATE_SYMBOL, DUPLICATE_SYMBOL])
  })
})
