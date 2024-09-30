import { describe, expect, it } from 'vitest'

import { encodePaths } from '../src/encoding'
import { collectPaths } from '../src/paths'
import { prunePaths } from '../src/prune'
import { compileEdgeTemplate, compileNodeTemplate, compileStepWeighting } from '../src/templates/parser'

import { createTestModel } from './test-utils'

describe('pruning', () => {
  it('can prune paths with same nodes', () => {
    const model = createTestModel(['a', 'b', 'c', 'd'], [['a', 'b'], ['a', 'b'], ['b', 'c'], ['c', 'd']])
    const paths = prunePaths(encodePaths(collectPaths(model, {
      allowCycles: false,
      minPathLength: 1,
      maxPathLength: 3,
      minPathWeight: 0,
      maxPathWeight: Number.MAX_SAFE_INTEGER,
      pathWeight: 'length',
      maxPaths: -1,
      order: 'asc',
    }, [compileStepWeighting('1')]), model, {
      nodeTemplates: [compileNodeTemplate('{{id}}')],
      edgeTemplates: [compileEdgeTemplate('{{tag}}')],
    }), 'node')
    expect(paths).toMatchInlineSnapshot(`
      [
        {
          "edges": [
            "edge",
            "edge",
            "edge",
          ],
          "nodes": [
            [
              1,
              "a",
            ],
            [
              2,
              "b",
            ],
            [
              3,
              "c",
            ],
            [
              4,
              "d",
            ],
          ],
          "stepWeights": [
            1,
            1,
            1,
          ],
          "weight": 3,
        },
      ]
    `)
  })

  it('can prune paths with same encoding', () => {
    const model = createTestModel(['a', 'b', 'c', 'd'], [['a', 'b'], ['c', 'd']])
    const paths = prunePaths(encodePaths(collectPaths(model, {
      allowCycles: false,
      minPathLength: 1,
      maxPathLength: 3,
      minPathWeight: 0,
      maxPathWeight: Number.MAX_SAFE_INTEGER,
      pathWeight: 'length',
      maxPaths: -1,
      order: 'asc',
    }, [compileStepWeighting('1')]), model, {
      nodeTemplates: [compileNodeTemplate('node')],
      edgeTemplates: [compileEdgeTemplate('{{tag}}')],
    }), 'encoding')
    expect(paths).toMatchInlineSnapshot(`
      [
        {
          "edges": [
            "edge",
          ],
          "nodes": [
            [
              1,
              "node",
            ],
            [
              2,
              "node",
            ],
          ],
          "stepWeights": [
            1,
          ],
          "weight": 1,
        },
      ]
    `)
  })
})
