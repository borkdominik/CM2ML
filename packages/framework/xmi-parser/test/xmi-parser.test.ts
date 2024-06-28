import fs from 'node:fs'

import { Metamodel } from '@cm2ml/ir'
import { describe, expect, it } from 'vitest'

import { createXmiParser } from '../src/index'

const metamodel = new Metamodel({
  attributes: ['id', 'type'],
  idAttribute: 'id',
  typeAttributes: ['type'],
  types: [],
  tags: [],
})

describe('xmi-parser', () => {
  it('should parse', () => {
    const input = fs.readFileSync(`${import.meta.dirname}/../../../../models/xmi-model.xmi`, 'utf-8')
    const xmiParser = createXmiParser(metamodel, () => { })
    const output = xmiParser.validateAndInvoke(input, {
      debug: false,
      strict: true,
    })
    expect(output.show()).toMatchSnapshot()
  })
})
