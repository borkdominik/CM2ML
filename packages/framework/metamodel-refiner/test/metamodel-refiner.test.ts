import { GraphModel } from '@cm2ml/ir'
import { createHandlerRegistry, createMetamodel } from '@cm2ml/metamodel'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRefiner } from '../src'

import { testMetamodel } from './test-utils'

const { defineAbstract, define } = createMetamodel(testMetamodel)

const C = defineAbstract('C')
const cHandler = vi.fn()
C.createHandler(cHandler)

const A = define('A', undefined, C)
const aHandler = vi.fn()
A.createHandler(aHandler)

const B = define('B', undefined, A)
const bHandler = vi.fn()
B.createHandler(bHandler)

const { inferHandler } = createHandlerRegistry(testMetamodel, {
  AHandler: A,
  BHandler: B,
})

describe('metamodel refiner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('removes non-model elements', () => {
    const refine = createRefiner(testMetamodel, inferHandler)

    const model = new GraphModel(testMetamodel, { debug: false, strict: true })
    const nonModelRoot = model.addNode('nonModelRoot')
    model.root = nonModelRoot

    const a = model.addNode('a')
    a.type = 'A'
    const actualRoot = a
    nonModelRoot.addChild(actualRoot)

    const b = model.addNode('b')
    b.type = 'B'
    actualRoot.addChild(b)

    refine(model, {})

    expect(model.root).toBe(actualRoot)
  })

  it('calls handlers', () => {
    const refine = createRefiner(testMetamodel, inferHandler)

    const model = new GraphModel(testMetamodel, { debug: false, strict: true })
    const nonModelRoot = model.addNode('nonModelRoot')
    model.root = nonModelRoot

    const a = model.addNode('a')
    a.type = 'A'
    const actualRoot = a
    nonModelRoot.addChild(actualRoot)

    const b = model.addNode('b')
    b.type = 'B'
    actualRoot.addChild(b)

    refine(model, {})

    // Called twice, once for node a and once for node b
    expect(aHandler).toHaveBeenCalledTimes(2)
    // Called once for node b
    expect(bHandler).toHaveBeenCalledTimes(1)
    // Called twice, once for node a and once for node b
    expect(cHandler).toHaveBeenCalledTimes(2)
  })

  it('replaces tags with types', () => {
    const refine = createRefiner(testMetamodel, inferHandler)

    const model = new GraphModel(testMetamodel, { debug: false, strict: true })
    const nonModelRoot = model.addNode('nonModelRoot')
    model.root = nonModelRoot

    const a = model.addNode('a')
    a.type = 'A'
    const actualRoot = a
    nonModelRoot.addChild(actualRoot)

    const b = model.addNode('b')
    b.type = 'B'
    actualRoot.addChild(b)

    expect(a.tag).toBe('a')
    expect(b.tag).toBe('b')

    refine(model, {})

    expect(a.tag).toBe('A')
    expect(b.tag).toBe('B')
  })

  it('invokes handler callbacks', () => {
    const refine = createRefiner(testMetamodel, inferHandler)

    const model = new GraphModel(testMetamodel, { debug: false, strict: true })
    const nonModelRoot = model.addNode('nonModelRoot')
    model.root = nonModelRoot

    const a = model.addNode('a')
    a.type = 'A'
    const actualRoot = a
    nonModelRoot.addChild(actualRoot)

    const b = model.addNode('b')
    b.type = 'B'
    actualRoot.addChild(b)

    const callOrder: string[] = []
    const bCallback = vi.fn().mockImplementation(() => callOrder.push('b'))
    bHandler.mockReturnValue(bCallback)

    const cCallback = vi.fn().mockImplementation(() => callOrder.push('c'))
    cHandler.mockReturnValue(cCallback)

    refine(model, {})

    expect(bCallback).toHaveBeenCalledTimes(1)
    expect(cCallback).toHaveBeenCalledTimes(2)
    // Callback of most specific type first, with callbacks of child nodes first
    expect(callOrder).toEqual(['b', 'c', 'c'])
  })
})
