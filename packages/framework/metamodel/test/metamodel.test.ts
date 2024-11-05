import { GraphModel, GraphNode } from '@cm2ml/ir'
import { describe, expect, it } from 'vitest'

import { createMetamodel } from '../src'

import { testMetamodel } from './test-utils'

describe('MetamodelElement', () => {
  it('can be defined', () => {
    const { define } = createMetamodel(testMetamodel)
    const element = define('A', 'a')
    expect(element.name).toBe('A')
    expect(element.tag).toBe('a')
    expect(element.type).toBe('A')
    expect(element.isAbstract).toBe(false)
  })

  it('can be defined as abstract', () => {
    const { defineAbstract } = createMetamodel(testMetamodel)
    const element = defineAbstract('C')
    expect(element.name).toBe('C')
    expect(element.tag).toBe(undefined)
    expect(element.type).toBe(undefined)
    expect(element.isAbstract).toBe(true)
  })

  it('instantiates a hierarchy', () => {
    const { define, defineAbstract } = createMetamodel(testMetamodel)
    const A = define('A', 'a')
    const B = define('B', 'b', A)
    const C = defineAbstract('C', B)

    expect(C.generalizations.has(B)).toBe(true)
    expect(B.specializations.has(C)).toBe(true)

    expect(B.generalizations.has(A)).toBe(true)
    expect(A.specializations.has(B)).toBe(true)

    // Transitive generalizations are hidden
    expect(A.specializations.has(C)).toBe(false)
    // Transitive specializations are known
    expect(C.generalizations.has(A)).toBe(true)
  })

  it('can have multiple generalization', () => {
    const { defineAbstract, define } = createMetamodel(testMetamodel)
    const C = defineAbstract('C')
    const D = defineAbstract('D')
    const A = define('A', 'a', C, D)

    expect(A.generalizations.has(C)).toBe(true)
    expect(A.generalizations.has(D)).toBe(true)

    expect(C.specializations.has(A)).toBe(true)
    expect(D.specializations.has(A)).toBe(true)
  })

  describe('type narrowing', () => {
    it('can set an initial type', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const node = new GraphNode(model, 'a')

      expect(node.type).toBeUndefined()
      A.narrowType(node)
      expect(node.type).toBe(A.type)
    })

    it('can narrow a type', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')
      const B = define('B', 'b', A)

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const node = new GraphNode(model, 'a')
      node.type = A.type!

      expect(node.type).toBe(A.type)
      B.narrowType(node)
      expect(node.type).toBe(B.type)
    })

    it('does nothing if abstract', () => {
      const { defineAbstract } = createMetamodel(testMetamodel)
      const A = defineAbstract('C')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const node = new GraphNode(model, 'a')

      expect(node.type).toBeUndefined()
      A.narrowType(node)
      expect(node.type).toBeUndefined()
    })

    it('does not narrow if current type is not a generalization', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')
      const B = define('B', 'b')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const node = new GraphNode(model, 'a')
      node.type = A.type!

      expect(node.type).toBe(A.type)
      B.narrowType(node)
      expect(node.type).toBe(A.type)
    })
  })
})
