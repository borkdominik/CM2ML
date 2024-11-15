import { describe, expect, it } from 'vitest'

import { compileNodeTemplate } from '../src/templates/parser'

import { createTestModel } from './test-utils'

const testModel = createTestModel(['a', 'aa', 'b'], [['a', 'b'], ['b', 'a']])

const root = testModel.root
const a = testModel.getNodeById('a')!
const aa = testModel.getNodeById('aa')!
const b = testModel.getNodeById('b')!

describe('node templates', () => {
  it('parses keyword templates', () => {
    const template = compileNodeTemplate('{{id}} with type {{type}} and tag {{tag}}')
    expect(template(root, { length: 0, step: 0 })).toBe('root with type node and tag root')
    expect(template(a, { length: 0, step: 0 })).toBe('a with type node and tag node')
  })

  it('parses attribute templates', () => {
    const template = compileNodeTemplate('{{attr.id}} with type {{attr.type}}')
    expect(template(root, { length: 0, step: 0 })).toBe('root with type node')
  })

  describe('conditions', () => {
    it('parses conditional replacements', () => {
      const template = compileNodeTemplate('{{attr.id}} with type [[attr.id=root >> ({{attr.type}})]][[id=a >> other]]')
      expect(template(root, { length: 0, step: 0 })).toBe('root with type (node)')
      expect(template(a, { length: 0, step: 0 })).toBe('a with type other')
    })

    it('parses negated conditional replacements', () => {
      const template = compileNodeTemplate('{{attr.id}} with type [[attr.id=root >> (root)]][[id!=root >> other]]')
      expect(template(root, { length: 0, step: 0 })).toBe('root with type (root)')
      expect(template(a, { length: 0, step: 0 })).toBe('a with type other')
    })

    it('parses conditional templates', () => {
      const template = compileNodeTemplate('@attr.id = root >>> the root of type {{attr.type}}')
      expect(template(root, { length: 0, step: 0 })).toBe('the root of type node')
      expect(template(a, { length: 0, step: 0 })).toBe(undefined)
    })

    describe('path selector', () => {
      it('parses step matches', () => {
        const template = compileNodeTemplate('@path.step >= 1 >>> not the first step')
        expect(template(root, { length: 0, step: 0 })).toBe(undefined)
        expect(template(root, { length: 2, step: 1 })).toBe('not the first step')
        expect(template(a, { length: 2, step: 1 })).toBe('not the first step')
      })

      it('parses length matches', () => {
        const template = compileNodeTemplate('@path.length >= 1 >>> at least one step')
        expect(template(root, { length: 0, step: 0 })).toBe(undefined)
        expect(template(root, { length: 1, step: 1 })).toBe('at least one step')
        expect(template(root, { length: 2, step: 1 })).toBe('at least one step')
      })
    })

    describe('exists', () => {
      it('parses attribute existence', () => {
        const negativeTemplate = compileNodeTemplate('@attr.unknown.exists >>> should not appear')
        const positiveTemplate = compileNodeTemplate('@attr.id.exists >>> should appear')
        expect(negativeTemplate(root, { length: 0, step: 0 })).toBe(undefined)
        expect(positiveTemplate(root, { length: 0, step: 0 })).toBe('should appear')
      })

      it('parses attribute non-existence', () => {
        const positiveTemplate = compileNodeTemplate('@attr.unknown.not.exists >>> should appear')
        const negativeTemplate = compileNodeTemplate('@attr.id.not.exists >>> should not appear')
        expect(negativeTemplate(root, { length: 0, step: 0 })).toBe(undefined)
        expect(positiveTemplate(root, { length: 0, step: 0 })).toBe('should appear')
      })
    })

    describe('comparison operators', () => {
      describe('for numbers', () => {
        it('parses equality', () => {
          const template = compileNodeTemplate('@path.step = 0 >>> only the first')
          expect(template(root, { length: 2, step: 0 })).toBe('only the first')
          expect(template(root, { length: 2, step: 1 })).toBe(undefined)
        })

        it('parses inequality', () => {
          const template = compileNodeTemplate('@path.step != 0 >>> not the first')
          expect(template(root, { length: 2, step: 0 })).toBe(undefined)
          expect(template(root, { length: 2, step: 1 })).toBe('not the first')
        })

        it('parses less than', () => {
          const template = compileNodeTemplate('@path.step < 1 >>> the first')
          expect(template(root, { length: 2, step: 0 })).toBe('the first')
          expect(template(root, { length: 2, step: 1 })).toBe(undefined)
          expect(template(root, { length: 2, step: 2 })).toBe(undefined)
        })

        it('parses less than or equal', () => {
          const template = compileNodeTemplate('@path.step <= 1 >>> the first or second')
          expect(template(root, { length: 2, step: 0 })).toBe('the first or second')
          expect(template(root, { length: 2, step: 1 })).toBe('the first or second')
          expect(template(root, { length: 2, step: 2 })).toBe(undefined)
        })

        it('parses greater than', () => {
          const template = compileNodeTemplate('@path.step > 0 >>> not the first')
          expect(template(root, { length: 2, step: 0 })).toBe(undefined)
          expect(template(root, { length: 2, step: 1 })).toBe('not the first')
        })

        it('parses greater than or equal', () => {
          const template = compileNodeTemplate('@path.step >= 1 >>> not the first')
          expect(template(root, { length: 2, step: 0 })).toBe(undefined)
          expect(template(root, { length: 2, step: 1 })).toBe('not the first')
          expect(template(root, { length: 2, step: 2 })).toBe('not the first')
        })
      })

      describe('for strings', () => {
        it('parses equality', () => {
          const template = compileNodeTemplate('@id = root >>> the root')
          expect(template(root, { length: 0, step: 0 })).toBe('the root')
          expect(template(a, { length: 0, step: 0 })).toBe(undefined)
        })

        it('parses inequality', () => {
          const template = compileNodeTemplate('@id != root >>> not the root')
          expect(template(root, { length: 0, step: 0 })).toBe(undefined)
          expect(template(a, { length: 0, step: 0 })).toBe('not the root')
        })

        it('parses less than', () => {
          const template = compileNodeTemplate('@id < aa >>> before aa')
          expect(template(a, { length: 0, step: 0 })).toBe('before aa')
          expect(template(aa, { length: 0, step: 0 })).toBe(undefined)
          expect(template(b, { length: 0, step: 0 })).toBe(undefined)
        })

        it('parses less than or equal', () => {
          const template = compileNodeTemplate('@id <= aa >>> before or equal to aa')
          expect(template(a, { length: 0, step: 0 })).toBe('before or equal to aa')
          expect(template(aa, { length: 0, step: 0 })).toBe('before or equal to aa')
          expect(template(b, { length: 0, step: 0 })).toBe(undefined)
        })

        it('parses greater than', () => {
          const template = compileNodeTemplate('@id > aa >>> after aa')
          expect(template(a, { length: 0, step: 0 })).toBe(undefined)
          expect(template(aa, { length: 0, step: 0 })).toBe(undefined)
          expect(template(b, { length: 0, step: 0 })).toBe('after aa')
        })

        it('parses greater than or equal', () => {
          const template = compileNodeTemplate('@id >= aa >>> after or equal to aa')
          expect(template(a, { length: 0, step: 0 })).toBe(undefined)
          expect(template(aa, { length: 0, step: 0 })).toBe('after or equal to aa')
          expect(template(b, { length: 0, step: 0 })).toBe('after or equal to aa')
        })
      })
    })
  })

  describe('edge selections', () => {
    it('can select incoming edges', () => {
      const template = compileNodeTemplate('{{edges.in[source.id = a].id}}')
      expect(template(a, { length: 0, step: 0 })).toBe('')
      expect(template(b, { length: 0, step: 0 })).toBe('a-b')
    })

    it('can select outgoing edges', () => {
      const template = compileNodeTemplate('{{edges.out[source.id = a].id}}')
      expect(template(a, { length: 0, step: 0 })).toBe('a-b')
      expect(template(b, { length: 0, step: 0 })).toBe('')
    })
  })

  describe('invalid inputs', () => {
    it.each([
      '{{unknownKey}}',
      '{{attr.}}',
      '[[>>{{id}}]]',
      '[[id>>]]',
    ])('errors on invalid input "%s"', (invalidInput) => {
      expect(() => compileNodeTemplate(invalidInput)).toThrow()
    })
  })
})
