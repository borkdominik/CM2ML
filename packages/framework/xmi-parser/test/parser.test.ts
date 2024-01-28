import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import { createXmiParser } from '../src/index'

describe('XMI Parser', () => {
  it('should work', () => {
    const input = fs.readFileSync('../../../xmi-model.xmi', 'utf-8')
    const xmiParser = createXmiParser('id', () => {})
    const output = xmiParser.invoke(input, {
      debug: false,
      strict: true,
    })
    expect(output.show()).toMatchSnapshot()
  })
})
