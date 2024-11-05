import { describe, expect, it } from 'vitest'

import { compileEdgeTemplate } from '../src/templates/parser'

import { createTestModel } from './test-utils'

const testModel = createTestModel(['a', 'b'], [['a', 'b'], ['b', 'a'], ['a', 'a']])

const a = testModel.getNodeById('a')!
const b = testModel.getNodeById('b')!

const aOutgoing = a.outgoingEdges.values()

const ab = aOutgoing.next().value!
const ba = b.outgoingEdges.values().next().value!
const aa = aOutgoing.next().value!

describe('edge templates', () => {
  it('parses keyword templates', () => {
    const template = compileEdgeTemplate('{{attr.id}} with tag {{tag}}')
    expect(template(ab, { length: 1, step: 1 })).toBe('a-b with tag edge')
    expect(template(ba, { length: 1, step: 1 })).toBe('b-a with tag edge')
  })

  it('parses attribute templates', () => {
    const template = compileEdgeTemplate('{{attr.id}}')
    expect(template(ab, { length: 1, step: 1 })).toBe('a-b')
  })

  describe('conditions', () => {
    it('parses conditional replacements', () => {
      const template = compileEdgeTemplate('{{attr.id}} with tag [[attr.id=a-b >> ({{tag}})]][[attr.id=b-a >> other]]')
      expect(template(ab, { length: 1, step: 1 })).toBe('a-b with tag (edge)')
      expect(template(ba, { length: 1, step: 1 })).toBe('b-a with tag other')
    })

    it('parses negated conditional replacements', () => {
      const template = compileEdgeTemplate('{{attr.id}} with tag [[attr.id!=a-b >> ({{tag}})]][[attr.id!=b-a >> other]]')
      expect(template(ab, { length: 1, step: 1 })).toBe('a-b with tag other')
      expect(template(ba, { length: 1, step: 1 })).toBe('b-a with tag (edge)')
    })

    it('parses conditional templates', () => {
      const template = compileEdgeTemplate('@attr.id = a-b >>> the edge with tag {{tag}}')
      expect(template(ab, { length: 1, step: 1 })).toBe('the edge with tag edge')
      expect(template(ba, { length: 1, step: 1 })).toBe(undefined)
    })

    describe('path selector', () => {
      it('parses step matches', () => {
        const template = compileEdgeTemplate('@path.step > 1 >>> not the first step')
        expect(template(ab, { length: 1, step: 1 })).toBe(undefined)
        expect(template(ab, { length: 2, step: 2 })).toBe('not the first step')
        expect(template(ba, { length: 2, step: 2 })).toBe('not the first step')
      })

      it('parses length matches', () => {
        const template = compileEdgeTemplate('@path.length >= 2 >>> at least two steps')
        expect(template(ab, { length: 1, step: 1 })).toBe(undefined)
        expect(template(ab, { length: 2, step: 1 })).toBe('at least two steps')
        expect(template(ab, { length: 3, step: 1 })).toBe('at least two steps')
      })
    })

    describe('node selector', () => {
      it('parses source selector', () => {
        const template = compileEdgeTemplate('source = {{source.id}}.{{source.attr.type}}')
        expect(template(ab, { length: 1, step: 1 })).toBe('source = a.node')
        expect(template(ba, { length: 1, step: 1 })).toBe('source = b.node')
      })

      it('parses target selector', () => {
        const template = compileEdgeTemplate('target = {{target.id}}.{{target.attr.type}}')
        expect(template(ab, { length: 1, step: 1 })).toBe('target = b.node')
        expect(template(ba, { length: 1, step: 1 })).toBe('target = a.node')
      })
    })

    describe('exists', () => {
      it('parses attribute existence', () => {
        const negativeTemplate = compileEdgeTemplate('@attr.unknown.exists >>> should not appear')
        const positiveTemplate = compileEdgeTemplate('@attr.id.exists >>> should appear')
        expect(negativeTemplate(ab, { length: 1, step: 1 })).toBe(undefined)
        expect(positiveTemplate(ab, { length: 1, step: 1 })).toBe('should appear')
      })

      it('parses attribute non-existence', () => {
        const positiveTemplate = compileEdgeTemplate('@attr.unknown.not.exists >>> should appear')
        const negativeTemplate = compileEdgeTemplate('@attr.id.not.exists >>> should not appear')
        expect(negativeTemplate(ab, { length: 1, step: 1 })).toBe(undefined)
        expect(positiveTemplate(ab, { length: 1, step: 1 })).toBe('should appear')
      })
    })

    describe('comparison operators', () => {
      describe('for numbers', () => {
        it('parses equality', () => {
          const template = compileEdgeTemplate('@path.step = 1 >>> only the first')
          expect(template(ab, { length: 2, step: 1 })).toBe('only the first')
          expect(template(ab, { length: 2, step: 2 })).toBe(undefined)
        })

        it('parses inequality', () => {
          const template = compileEdgeTemplate('@path.step != 1 >>> not the first')
          expect(template(ab, { length: 2, step: 1 })).toBe(undefined)
          expect(template(ab, { length: 2, step: 2 })).toBe('not the first')
        })

        it('parses less than', () => {
          const template = compileEdgeTemplate('@path.length < 2 >>> shorter than 2')
          expect(template(ab, { length: 1, step: 1 })).toBe('shorter than 2')
          expect(template(ab, { length: 2, step: 1 })).toBe(undefined)
          expect(template(ab, { length: 3, step: 1 })).toBe(undefined)
        })

        it('parses less than or equal', () => {
          const template = compileEdgeTemplate('@path.length <= 2 >>> shorter than or equal to 2')
          expect(template(ab, { length: 1, step: 1 })).toBe('shorter than or equal to 2')
          expect(template(ab, { length: 2, step: 2 })).toBe('shorter than or equal to 2')
          expect(template(ab, { length: 3, step: 3 })).toBe(undefined)
        })

        it('parses greater than', () => {
          const template = compileEdgeTemplate('@path.step > 2 >>> greater than 2')
          expect(template(ab, { length: 3, step: 1 })).toBe(undefined)
          expect(template(ab, { length: 3, step: 2 })).toBe(undefined)
          expect(template(ab, { length: 3, step: 3 })).toBe('greater than 2')
        })

        it('parses greater than or equal', () => {
          const template = compileEdgeTemplate('@path.length >= 2 >>> greater than or equal to 2')
          expect(template(ab, { length: 1, step: 1 })).toBe(undefined)
          expect(template(ab, { length: 2, step: 2 })).toBe('greater than or equal to 2')
          expect(template(ab, { length: 3, step: 2 })).toBe('greater than or equal to 2')
        })
      })

      describe('for strings', () => {
        it('parses equality', () => {
          const template = compileEdgeTemplate('@attr.id = a-b >>> a to b')
          expect(template(ab, { length: 1, step: 1 })).toBe('a to b')
          expect(template(ba, { length: 1, step: 1 })).toBe(undefined)
        })

        it('parses inequality', () => {
          const template = compileEdgeTemplate('@attr.id != a-b >>> not a to b')
          expect(template(ab, { length: 1, step: 1 })).toBe(undefined)
          expect(template(ba, { length: 1, step: 1 })).toBe('not a to b')
        })

        it('parses less than', () => {
          const template = compileEdgeTemplate('@attr.id < a-b >>> before a-b')
          expect(template(aa, { length: 1, step: 1 })).toBe('before a-b')
          expect(template(ab, { length: 1, step: 1 })).toBe(undefined)
          expect(template(ba, { length: 1, step: 1 })).toBe(undefined)
        })

        it('parses less than or equal', () => {
          const template = compileEdgeTemplate('@attr.id <= a-b >>> before or equal to a-b')
          expect(template(aa, { length: 1, step: 1 })).toBe('before or equal to a-b')
          expect(template(ab, { length: 1, step: 1 })).toBe('before or equal to a-b')
          expect(template(ba, { length: 1, step: 1 })).toBe(undefined)
        })

        it('parses greater than', () => {
          const template = compileEdgeTemplate('@attr.id > a-b >>> after a-b')
          expect(template(aa, { length: 1, step: 1 })).toBe(undefined)
          expect(template(ab, { length: 1, step: 1 })).toBe(undefined)
          expect(template(ba, { length: 1, step: 1 })).toBe('after a-b')
        })

        it('parses greater than or equal', () => {
          const template = compileEdgeTemplate('@attr.id >= a-b >>> after or equal to a-b')
          expect(template(aa, { length: 1, step: 1 })).toBe(undefined)
          expect(template(ab, { length: 1, step: 1 })).toBe('after or equal to a-b')
          expect(template(ba, { length: 1, step: 1 })).toBe('after or equal to a-b')
        })
      })
    })
  })

  describe('invalid inputs', () => {
    it.each([
      '{{unknownKey}}',
      '{{attr.}}',
      '[[>>{{id}}]]',
      '[[id>>]]',
    ])('errors on invalid input "%s"', (invalidInput) => {
      expect(() => compileEdgeTemplate(invalidInput)).toThrow()
    })
  })
})
