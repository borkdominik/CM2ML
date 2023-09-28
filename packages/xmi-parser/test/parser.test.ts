import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import { parse } from '~/index'

describe('xmi-parser', () => {
  it('should work', () => {
    const input = fs.readFileSync('../../xmi-model.xmi', 'utf-8')
    const output = parse(input)
    expect(output).toBeDefined()
    // console.log(output.show())
  })
})
