import { GraphModel, GraphNode } from '@cm2ml/ir'
import { describe, expect, it } from 'vitest'

import { copyAttributes, createMetamodel, getParentOfType, inferAndSaveType, transformNodeToEdge } from '../src'

import { testMetamodel } from './test-utils'

describe('metamodel utils', () => {
  describe('inferAndSaveType', () => {
    it('should infer and save type', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const node = new GraphNode(model, 'a')

      expect(node.type).toBeUndefined()
      inferAndSaveType(node, A.type!, testMetamodel)
      expect(node.type).toBe(A.type)
    })

    it('does not overwrite existing types', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const node = new GraphNode(model, 'b')
      const type = 'B'
      node.type = type

      expect(node.type).toBe(type)
      inferAndSaveType(node, A.type!, testMetamodel)
      expect(node.type).toBe(type)
    })
  })

  describe('copyAttributes', () => {
    it('should copy attributes excluding the id for node targets', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const a = new GraphNode(model, 'a')
      const b = new GraphNode(model, 'b')

      a.addAttribute({ name: 'name', type: 'string', value: { literal: 'aName' } })
      a.addAttribute({ name: 'id', type: 'string', value: { literal: 'aId' } })
      a.addAttribute({ name: 'type', type: 'string', value: { literal: 'A' } })

      expect(b.attributes.size).toBe(0)
      copyAttributes(a, b)

      expect(b.attributes.size).toBe(2)
      expect(b.getAttribute('name')?.value.literal).toBe('aName')
      expect(b.getAttribute('id')?.value.literal).toBe(undefined)
      expect(b.getAttribute('type')?.value.literal).toBe('A')
    })

    it('should copy attributes including the id for edge targets', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const a = new GraphNode(model, 'a')
      const b = new GraphNode(model, 'b')
      const edge = model.addEdge('edge', a, b)

      a.addAttribute({ name: 'name', type: 'string', value: { literal: 'aName' } })
      a.addAttribute({ name: 'id', type: 'string', value: { literal: 'aId' } })
      a.addAttribute({ name: 'type', type: 'string', value: { literal: 'A' } })

      expect(edge.attributes.size).toBe(0)
      copyAttributes(a, edge)

      expect(edge.attributes.size).toBe(3)
      expect(edge.getAttribute('name')?.value.literal).toBe('aName')
      expect(edge.getAttribute('id')?.value.literal).toBe('aId')
      expect(edge.getAttribute('type')?.value.literal).toBe('A')
    })
  })

  describe('transformNodeToEdge', () => {
    it('can transform nodes to edges', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const aS = new GraphNode(model, 'a')
      model.root = aS
      const bS = new GraphNode(model, 'b')

      const aT = new GraphNode(model, 'a')
      const bT = new GraphNode(model, 'b')

      const e = new GraphNode(model, 'e')
      e.addAttribute({ name: 'name', type: 'string', value: { literal: 'edgeName' } })
      const eChild = new GraphNode(model, 'eChild')
      e.addChild(eChild)
      aS.addChild(e)

      const edges = transformNodeToEdge(e, [aS, bS], [aT, bT], 'edgeTag')

      expect(edges.length).toBe(4)

      expect(edges[0]!.source).toBe(aS)
      expect(edges[0]!.target).toBe(aT)
      expect(edges[0]!.name).toBe('edgeName')
      expect(edges[0]!.tag).toBe('edgeTag')

      expect(edges[1]!.source).toBe(aS)
      expect(edges[1]!.target).toBe(bT)
      expect(edges[1]!.name).toBe('edgeName')
      expect(edges[1]!.tag).toBe('edgeTag')

      expect(edges[2]!.source).toBe(bS)
      expect(edges[2]!.target).toBe(aT)
      expect(edges[2]!.name).toBe('edgeName')
      expect(edges[2]!.tag).toBe('edgeTag')

      expect(edges[3]!.source).toBe(bS)
      expect(edges[3]!.target).toBe(bT)
      expect(edges[3]!.name).toBe('edgeName')
      expect(edges[3]!.tag).toBe('edgeTag')

      expect(e.model).toBe(undefined)
      expect(eChild.parent).toBe(aS)
    })

    it('cannot transform a root node', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const aS = new GraphNode(model, 'a')
      model.root = aS
      const bS = new GraphNode(model, 'b')
      expect(() => transformNodeToEdge(aS, [bS], [bS], 'edgeTag'))
        .toThrowErrorMatchingInlineSnapshot(`[Error: Cannot transform root node to edge]`)
    })

    it('cannot transform without sources', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const aS = new GraphNode(model, 'a')
      const bS = new GraphNode(model, 'b')
      model.root = bS
      expect(() => transformNodeToEdge(aS, [], [bS], 'edgeTag'))
        .toThrowErrorMatchingInlineSnapshot(`[Error: Cannot transform node to edge without sources]`)
    })

    it('cannot transform without targets', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const aS = new GraphNode(model, 'a')
      const bS = new GraphNode(model, 'b')
      model.root = bS
      expect(() => transformNodeToEdge(aS, [bS], [], 'edgeTag'))
        .toThrowErrorMatchingInlineSnapshot(`[Error: Cannot transform node to edge without targets]`)
    })

    it('cannot transform if sources contain edge to transform', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const aS = new GraphNode(model, 'a')
      const bS = new GraphNode(model, 'b')
      model.root = bS
      expect(() => transformNodeToEdge(aS, [aS], [bS], 'edgeTag'))
        .toThrowErrorMatchingInlineSnapshot(`[Error: Cannot transform node to edge with itself as source]`)
    })

    it('cannot transform if targets contain edge to transform', () => {
      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const aS = new GraphNode(model, 'a')
      const bS = new GraphNode(model, 'b')
      model.root = bS
      expect(() => transformNodeToEdge(aS, [bS], [aS], 'edgeTag'))
        .toThrowErrorMatchingInlineSnapshot(`[Error: Cannot transform node to edge with itself as target]`)
    })
  })

  describe('getParentOfType', () => {
    it('can get a parent of a specific type', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const a = new GraphNode(model, 'a')
      a.type = A.type!

      const b = new GraphNode(model, 'b')
      a.addChild(b)

      const parent = getParentOfType(b, A)
      expect(parent).toBe(a)
    })

    it('searches transitively', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const a = new GraphNode(model, 'a')
      a.type = A.type!

      const b = new GraphNode(model, 'b')
      a.addChild(b)

      const c = new GraphNode(model, 'c')
      b.addChild(c)

      const parent = getParentOfType(c, A)
      expect(parent).toBe(a)
    })

    it('returns undefined if no such parent exists', () => {
      const { define } = createMetamodel(testMetamodel)
      const A = define('A', 'a')
      const B = define('B', 'b')

      const model = new GraphModel(testMetamodel, { debug: false, strict: true })
      const a = new GraphNode(model, 'a')
      a.type = A.type!

      const b = new GraphNode(model, 'b')
      a.addChild(b)

      const parent = getParentOfType(b, B)
      expect(parent).toBeUndefined()
    })
  })
})
