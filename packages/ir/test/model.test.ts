import { describe, expect, it } from 'vitest'

import { GraphModel } from '../src'

describe('ir model', () => {
  it('can add nodes and edges', () => {
    const model = new GraphModel('id', 'root')

    const child = model.addNode('child')
    model.root.addChild(child)
    expect(child.parent).toBe(model.root)

    const edge = model.addEdge('edge', model.root, child)

    const edges = model.edges
    expect(edges.size).toBe(1)
    expect(edges.values().next()).toBe(edge)
    expect(edge.source).toBe(model.root)
    expect(edge.target).toBe(child)
  })
})
