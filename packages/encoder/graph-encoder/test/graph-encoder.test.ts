import { getFirstNonError } from '@cm2ml/plugin'
import { describe, expect, it } from 'vitest'

import type { AdjacencyEncoding, AdjacencyListEncoding, AdjacencyMatrixEncoding } from '../src'
import { GraphEncoder } from '../src'

import { createTestModel } from './test-utils'

describe('graph encoder', () => {
  describe('features', () => {
    it('encodes nodes', () => {
      const model = createTestModel()
      const output = GraphEncoder.validateAndInvoke([model], { format: 'list' })
      const encoding = getFirstNonError(output)
      expect(encoding).toBeDefined()

      const { nodes, nodeFeatureVectors } = encoding!.data as AdjacencyListEncoding & AdjacencyEncoding
      const metadata = encoding!.metadata

      expect(nodes).toEqual(['a', 'b', 'root'])

      const [, , idAttr] = metadata.nodeFeatures.find(([name]) => name === 'id')!
      const [, , typeAttr] = metadata.nodeFeatures.find(([name]) => name === 'type')!

      expect(nodeFeatureVectors).toEqual([
        [idAttr!.a, typeAttr!.A],
        [idAttr!.b, typeAttr!.B],
        [idAttr!.root, typeAttr!.A],
      ])
    })

    it('encodes edges', () => {
      const model = createTestModel()
      const output = GraphEncoder.validateAndInvoke([model], { format: 'list' })
      const encoding = getFirstNonError(output)
      expect(encoding).toBeDefined()

      const { nodes, edgeFeatureVectors } = encoding!.data as AdjacencyListEncoding
      const metadata = encoding!.metadata

      expect(nodes).toEqual(['a', 'b', 'root'])

      const [, , edgeAttr] = metadata.edgeFeatures.find(([name]) => name === 'edgeAttr')!
      const [, , secondEdgeAttr] = metadata.edgeFeatures.find(([name]) => name === 'secondEdgeAttr')!

      expect(edgeFeatureVectors).toEqual([
        [edgeAttr!.catA, 0],
        [edgeAttr!.catB, 0],
        [0, secondEdgeAttr!.catA],
      ])
    })
  })

  describe('adjacency list', () => {
    it('can encode a graph as an adjacency list', () => {
      const model = createTestModel()
      const output = GraphEncoder.validateAndInvoke([model], { format: 'list' })
      const encoding = getFirstNonError(output)
      expect(encoding).toBeDefined()

      const { nodes, list } = encoding!.data as AdjacencyListEncoding

      expect(nodes).toEqual(['a', 'b', 'root'])

      expect(list).toEqual([
        [nodes.indexOf('a'), nodes.indexOf('b')], // a -> b
        [nodes.indexOf('b'), nodes.indexOf('root')], // b -> root
        [nodes.indexOf('root'), nodes.indexOf('a')], // root -> a
      ])
    })

    it('can encode a graph as a weighted adjacency list', () => {
      const model = createTestModel()
      model.addEdge('edge', model.getNodeById('a')!, model.getNodeById('b')!)
      const output = GraphEncoder.validateAndInvoke([model], { format: 'list', weighted: true })
      const encoding = getFirstNonError(output)
      expect(encoding).toBeDefined()

      const { nodes, list } = encoding!.data as AdjacencyListEncoding

      expect(nodes).toEqual(['a', 'b', 'root'])

      expect(list).toEqual([
        [nodes.indexOf('a'), nodes.indexOf('b'), 0.5], // a -> b
        [nodes.indexOf('a'), nodes.indexOf('b'), 0.5], // a -> b
        [nodes.indexOf('b'), nodes.indexOf('root'), 1], // b -> root
        [nodes.indexOf('root'), nodes.indexOf('a'), 1], // root -> a
      ])
    })
  })

  describe('adjacency matrix', () => {
    it('can encode a graph as an adjacency matrix', () => {
      const model = createTestModel()
      const output = GraphEncoder.validateAndInvoke([model], { format: 'matrix' })
      const encoding = getFirstNonError(output)
      expect(encoding).toBeDefined()

      const { nodes, matrix } = encoding!.data as AdjacencyMatrixEncoding

      expect(nodes).toEqual(['a', 'b', 'root'])

      expect(matrix).toEqual([
        [0, 1, 0], // a -> b
        [0, 0, 1], // b -> root
        [1, 0, 0], // root -> a
      ])
    })

    it('can encode a graph as a weighted adjacency matrix', () => {
      const model = createTestModel()
      model.addEdge('edge', model.getNodeById('a')!, model.getNodeById('b')!)
      const output = GraphEncoder.validateAndInvoke([model], { format: 'matrix', weighted: true })
      const encoding = getFirstNonError(output)
      expect(encoding).toBeDefined()

      const { nodes, matrix } = encoding!.data as AdjacencyMatrixEncoding

      expect(nodes).toEqual(['a', 'b', 'root'])

      expect(matrix).toEqual([
        [0, 0.5, 0], // a -> b
        [0, 0, 1], // b -> root
        [1, 0, 0], // root -> a
      ])
    })
  })
})
