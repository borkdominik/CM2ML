import { describe, expect, it } from 'vitest'

import { compileNodeTemplate } from '../src/templates/parser'

import { createTestModel } from './test-utils'

const testModel = createTestModel(['a', 'aa', 'b'], [])

describe('parser', () => {
  it('parses keyword templates', () => {
    const template = compileNodeTemplate('{{id}} with type {{type}} and tag {{tag}}')
    expect(template(testModel.root, 0)).toBe('root with type node and tag root')
    expect(template(testModel.getNodeById('a')!, 0)).toBe('a with type node and tag node')
  })

  it('parses attribute templates', () => {
    const template = compileNodeTemplate('{{attr.id}} with type {{attr.type}}')
    expect(template(testModel.root, 0)).toBe('root with type node')
  })

  describe('conditions', () => {
    it('parses conditional replacements', () => {
      const template = compileNodeTemplate('{{attr.id}} with type [[attr.id=root->{{attr.type}}]][[id=a->other]]')
      expect(template(testModel.root, 0)).toBe('root with type node')
      expect(template(testModel.getNodeById('a')!, 0)).toBe('a with type other')
    })

    it('parses negated conditional replacements', () => {
      const template = compileNodeTemplate('{{attr.id}} with type [[attr.id=root-><<root>>]][[id!=root->other]]')
      expect(template(testModel.root, 0)).toBe('root with type <<root>>')
      expect(template(testModel.getNodeById('a')!, 0)).toBe('a with type other')
    })

    it('parses conditional templates', () => {
      const template = compileNodeTemplate('@attr.id = root -> the root of type {{attr.type}}')
      expect(template(testModel.root, 0)).toBe('the root of type node')
      expect(template(testModel.getNodeById('a')!, 0)).toBe(undefined)
    })

    it('parses step matches', () => {
      const template = compileNodeTemplate('@step >= 1 -> not the first step')
      expect(template(testModel.root, 0)).toBe(undefined)
      expect(template(testModel.root, 1)).toBe('not the first step')
      expect(template(testModel.getNodeById('a')!, 2)).toBe('not the first step')
    })

    describe('comparison operators', () => {
      describe('for numbers', () => {
        it('parses equality', () => {
          const template = compileNodeTemplate('@step = 0 -> only the first')
          expect(template(testModel.root, 0)).toBe('only the first')
          expect(template(testModel.root, 1)).toBe(undefined)
        })

        it('parses inequality', () => {
          const template = compileNodeTemplate('@step != 0 -> not the first')
          expect(template(testModel.root, 0)).toBe(undefined)
          expect(template(testModel.root, 1)).toBe('not the first')
        })

        it('parses less than', () => {
          const template = compileNodeTemplate('@step < 1 -> the first')
          expect(template(testModel.root, 0)).toBe('the first')
          expect(template(testModel.root, 1)).toBe(undefined)
          expect(template(testModel.root, 2)).toBe(undefined)
        })

        it('parses less than or equal', () => {
          const template = compileNodeTemplate('@step <= 1 -> the first or second')
          expect(template(testModel.root, 0)).toBe('the first or second')
          expect(template(testModel.root, 1)).toBe('the first or second')
          expect(template(testModel.root, 2)).toBe(undefined)
        })

        it('parses greater than', () => {
          const template = compileNodeTemplate('@step > 0 -> not the first')
          expect(template(testModel.root, 0)).toBe(undefined)
          expect(template(testModel.root, 1)).toBe('not the first')
        })

        it('parses greater than or equal', () => {
          const template = compileNodeTemplate('@step >= 1 -> not the first')
          expect(template(testModel.root, 0)).toBe(undefined)
          expect(template(testModel.root, 1)).toBe('not the first')
          expect(template(testModel.root, 2)).toBe('not the first')
        })
      })

      describe('for strings', () => {
        it('parses equality', () => {
          const template = compileNodeTemplate('@id = root -> the root')
          expect(template(testModel.root, 0)).toBe('the root')
          expect(template(testModel.getNodeById('a')!, 0)).toBe(undefined)
        })

        it('parses inequality', () => {
          const template = compileNodeTemplate('@id != root -> not the root')
          expect(template(testModel.root, 0)).toBe(undefined)
          expect(template(testModel.getNodeById('a')!, 0)).toBe('not the root')
        })

        it('parses less than', () => {
          const template = compileNodeTemplate('@id< aa -> before aa')
          expect(template(testModel.getNodeById('a')!, 0)).toBe('before aa')
          expect(template(testModel.getNodeById('aa')!, 0)).toBe(undefined)
          expect(template(testModel.getNodeById('b')!, 0)).toBe(undefined)
        })

        it('parses less than or equal', () => {
          const template = compileNodeTemplate('@id <= aa -> before or equal to aa')
          expect(template(testModel.getNodeById('a')!, 0)).toBe('before or equal to aa')
          expect(template(testModel.getNodeById('aa')!, 0)).toBe('before or equal to aa')
          expect(template(testModel.getNodeById('b')!, 0)).toBe(undefined)
        })

        it('parses greater than', () => {
          const template = compileNodeTemplate('@id > aa -> after aa')
          expect(template(testModel.getNodeById('a')!, 0)).toBe(undefined)
          expect(template(testModel.getNodeById('aa')!, 0)).toBe(undefined)
          expect(template(testModel.getNodeById('b')!, 0)).toBe('after aa')
        })

        it('parses greater than or equal', () => {
          const template = compileNodeTemplate('@id >= aa -> after or equal to aa')
          expect(template(testModel.getNodeById('a')!, 0)).toBe(undefined)
          expect(template(testModel.getNodeById('aa')!, 0)).toBe('after or equal to aa')
          expect(template(testModel.getNodeById('b')!, 0)).toBe('after or equal to aa')
        })
      })
    })
  })

  describe('invalid inputs', () => {
    it.each([
      '{{unknownKey}}',
      '{{attr.}}',
      '[[->{{id}}]]',
      '[[id->]]',
    ])('errors on invalid input "%s"', (invalidInput) => {
      expect(() => compileNodeTemplate(invalidInput)).toThrow()
    })
  })
})
