import { GraphModel, GraphNode } from '@cm2ml/ir'
import { describe, expect, it, vi } from 'vitest'

import { createHandlerRegistry, createMetamodel } from '../src'

import { testMetamodel } from './test-utils'

describe('handlers', () => {
  it('can infer the correct handler', () => {
    const { defineAbstract, define } = createMetamodel(testMetamodel)
    const A = define('A', 'a')
    const aHandler = vi.fn()
    A.createHandler(aHandler)

    const C = defineAbstract('C', A)
    const cHandler = vi.fn()
    C.createHandler(cHandler)

    const D = defineAbstract('D', A)
    const dHandler = vi.fn()
    D.createHandler(dHandler, {
      name: { type: 'string', defaultValue: 'DName' },
    })

    const B = define('B', 'b', C, D)
    const bHandler = vi.fn()
    B.createHandler(bHandler)

    const registry = createHandlerRegistry(testMetamodel, {
      AHandler: A,
      BHandler: B,
    })

    const model = new GraphModel(testMetamodel, { debug: false, strict: true })
    const node = new GraphNode(model, 'a')
    node.type = B.type!

    const handler = registry.inferHandler(node)
    expect(handler).toBe(B)

    const visited = new Set<(typeof A | typeof B)>()
    handler?.handle(node, {}, visited)

    // aHandler is only called once, even though A is a generalization of both C and D
    expect(aHandler).toHaveBeenCalledTimes(1)
    expect(bHandler).toHaveBeenCalledTimes(1)
    expect(cHandler).toHaveBeenCalledTimes(1)
    expect(dHandler).toHaveBeenCalledTimes(1)

    // Default values are set
    expect(node.name).toBe('DName')
  })
})
