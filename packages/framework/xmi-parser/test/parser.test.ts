import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import { XmiParser } from '../src/index'

describe('XMI Parser', () => {
  it('should work', () => {
    const input = fs.readFileSync('../../../xmi-model.xmi', 'utf-8')
    const output = XmiParser.invoke(input, {
      debug: false,
      idAttribute: 'id',
      strict: true,
    })
    expect(output).toBeDefined()
    // console.log(output.show())
  })
})
