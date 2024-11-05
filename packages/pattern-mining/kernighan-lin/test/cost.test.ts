import { describe, expect, it, vitest } from 'vitest'

import { CostCache } from '../src/cost'

describe('cost-cache', () => {
  it('caches costs', () => {
    const cost = vitest.fn().mockImplementation((a: string, b: string) => a.length + b.length)
    const cache = new CostCache<string>(cost)
    expect(cost).toHaveBeenCalledTimes(0)
    expect(cache.getCost('a', 'b')).toBe(2)
    expect(cost).toHaveBeenCalledTimes(1)
    expect(cache.getCost('b', 'a')).toBe(2)
    expect(cost).toHaveBeenCalledTimes(1)
    expect(cache.getCost('aa', 'b')).toBe(3)
    expect(cost).toHaveBeenCalledTimes(2)
  })
})
