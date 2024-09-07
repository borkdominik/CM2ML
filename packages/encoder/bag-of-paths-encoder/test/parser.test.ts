import { describe, expect, it } from 'vitest'

import { compileTemplate } from '../src/templates/parser'

import { createTestModel } from './test-utils'

const testModel = createTestModel(['a'], [])

describe('parser', () => {
  it('parses keyword templates', () => {
    const template = compileTemplate('{{id}} with type {{type}} and tag {{tag}}')
    expect(template(testModel.root)).toBe('root with type node and tag root')
    expect(template(testModel.getNodeById('a')!)).toBe('a with type node and tag node')
  })

  it('parsed attribute templates', () => {
    const template = compileTemplate('{{attr.id}} with type {{attr.type}}')
    expect(template(testModel.root)).toBe('root with type node')
  })

  describe('conditions', () => {
    it('parses conditional replacements', () => {
      const template = compileTemplate('{{attr.id}} with type [[attr.id=root->{{attr.type}}]][[id=a->other]]')
      expect(template(testModel.root)).toBe('root with type node')
      expect(template(testModel.getNodeById('a')!)).toBe('a with type other')
    })

    it('parsed negated conditional replacements', () => {
      const template = compileTemplate('{{attr.id}} with type [[attr.id=root-><<root>>]][[id!=root->other]]')
      expect(template(testModel.root)).toBe('root with type <<root>>')
      expect(template(testModel.getNodeById('a')!)).toBe('a with type other')
    })

    it('parsed conditional templates', () => {
      const template = compileTemplate('@attr.id = root -> the root of type {{attr.type}}')
      expect(template(testModel.root)).toBe('the root of type node')
      expect(template(testModel.getNodeById('a')!)).toBe(undefined)
    })
  })

  describe('invalid inputs', () => {
    it.each([
      '{{unknownKey}}',
      '{{attr.}}',
      '[[->{{id}}]]',
      '[[id->]]',
    ])('errors on invalid input "%s"', (invalidInput) => {
      expect(() => compileTemplate(invalidInput)).toThrow()
    })
  })
})
