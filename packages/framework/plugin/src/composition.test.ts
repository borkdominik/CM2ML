import { describe, expect, it } from 'vitest'

import { batch, compose } from './composition'
import { add } from './plugins.test'

describe('compose', () => {
  it('can compose two plugins', () => {
    const composed = compose(add, add)

    const result = composed.invoke(0, { summand: 21 }, undefined)
    expect(result).toBe(42)
  })

  it('can batch a plugin', () => {
    const batched = batch(add)

    const result = batched.invoke([1, 10, 100], { summand: 1 }, undefined)
    expect(result).toEqual([2, 11, 101])
  })
})
