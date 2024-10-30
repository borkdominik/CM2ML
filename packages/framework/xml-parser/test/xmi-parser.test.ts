import fs from 'node:fs'

import { Metamodel } from '@cm2ml/ir'
import { describe, expect, it } from 'vitest'

import { createXMLParser } from '../src/index'

const metamodel = new Metamodel({
  attributes: ['id', 'type'],
  idAttribute: 'id',
  typeAttributes: ['type'],
  types: [],
  tags: [],
})

describe('xml-parser', () => {
  it('should parse', () => {
    const input = fs.readFileSync(`${import.meta.dirname}/../../../../models/xmi-model.xmi`, 'utf-8')
    const xmlParser = createXMLParser(metamodel, () => { })
    const output = xmlParser.validateAndInvoke(input, {
      debug: false,
      strict: true,
    })
    expect(output.show()).toMatchSnapshot()
  })
})
