import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import { XmiParser } from '~/index'

describe('XMI Parser', () => {
  it('should work', () => {
    const input = fs.readFileSync('../../xmi-model.xmi', 'utf-8')
    const output = XmiParser.invoke(input, { idAttribute: 'id' })
    expect(output).toBeDefined()
    // console.log(output.show())
  })
})
