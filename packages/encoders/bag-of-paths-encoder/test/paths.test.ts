import { describe, expect, it } from 'vitest'

import type { PathData } from '../src/paths'
import { collectPaths } from '../src/paths'
import { compileStepWeighting } from '../src/templates/parser'

import { createTestModel } from './test-utils'

function snapshottify(paths: PathData[]) {
  return paths.map((path) => ({ stepWeights: path.stepWeights, weight: path.weight, steps: path.steps.map((step) => step.node.id) }))
}

describe('paths', () => {
  it('does not include duplicates', () => {
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
    const paths = collectPaths(model, {
      allowCycles: false,
      minPathLength: 1,
      maxPathLength: 3,
      minPathWeight: 0,
      maxPathWeight: Number.MAX_SAFE_INTEGER,
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    }, [compileStepWeighting('1')])
    expect(snapshottify(paths)).toMatchInlineSnapshot(`
      [
        {
          "stepWeights": [
            1,
            1,
          ],
          "steps": [
            "a",
            "b",
            "c",
          ],
          "weight": 2,
        },
        {
          "stepWeights": [
            1,
            1,
          ],
          "steps": [
            "a",
            "b",
            "c",
          ],
          "weight": 2,
        },
        {
          "stepWeights": [
            1,
          ],
          "steps": [
            "a",
            "b",
          ],
          "weight": 1,
        },
        {
          "stepWeights": [
            1,
          ],
          "steps": [
            "a",
            "b",
          ],
          "weight": 1,
        },
        {
          "stepWeights": [
            1,
          ],
          "steps": [
            "b",
            "c",
          ],
          "weight": 1,
        },
      ]
    `)
  })

  it('can include cycles', () => {
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'a'], ['b', 'c']])
    const paths = collectPaths(model, {
      allowCycles: true,
      minPathLength: 1,
      maxPathLength: 3,
      minPathWeight: 0,
      maxPathWeight: Number.MAX_SAFE_INTEGER,
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    }, [compileStepWeighting('1')])
    expect(snapshottify(paths).map(({ steps }) => steps)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "a",
          "b",
        ],
        [
          "b",
          "a",
          "b",
          "a",
        ],
        [
          "b",
          "a",
          "b",
          "c",
        ],
        [
          "a",
          "b",
          "a",
        ],
        [
          "a",
          "b",
          "c",
        ],
        [
          "b",
          "a",
          "b",
        ],
        [
          "a",
          "b",
        ],
        [
          "b",
          "a",
        ],
        [
          "b",
          "c",
        ],
      ]
    `)
  })

  it('can include subpaths', () => {
    const model = createTestModel(['a', 'b', 'c', 'd'], [['a', 'b'], ['b', 'c'], ['c', 'd']])
    const paths = collectPaths(model, {
      allowCycles: false,
      minPathLength: 1,
      maxPathLength: 3,
      minPathWeight: 0,
      maxPathWeight: Number.MAX_SAFE_INTEGER,
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    }, [compileStepWeighting('1')])
    expect(snapshottify(paths).map(({ steps }) => steps)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "c",
          "d",
        ],
        [
          "a",
          "b",
          "c",
        ],
        [
          "b",
          "c",
          "d",
        ],
        [
          "a",
          "b",
        ],
        [
          "b",
          "c",
        ],
        [
          "c",
          "d",
        ],
      ]
    `)
  })

  it('can include subpaths with cycles', () => {
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'a'], ['b', 'c']])
    const paths = collectPaths(model, {
      allowCycles: true,
      minPathLength: 1,
      maxPathLength: 3,
      minPathWeight: 0,
      maxPathWeight: Number.MAX_SAFE_INTEGER,
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    }, [compileStepWeighting('1')])
    expect(snapshottify(paths).map(({ steps }) => steps)).toMatchInlineSnapshot(`
      [
        [
          "a",
          "b",
          "a",
          "b",
        ],
        [
          "b",
          "a",
          "b",
          "a",
        ],
        [
          "b",
          "a",
          "b",
          "c",
        ],
        [
          "a",
          "b",
          "a",
        ],
        [
          "a",
          "b",
          "c",
        ],
        [
          "b",
          "a",
          "b",
        ],
        [
          "a",
          "b",
        ],
        [
          "b",
          "a",
        ],
        [
          "b",
          "c",
        ],
      ]
    `)
  })

  describe('filtering', () => {
    it('can limit the number of paths', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        minPathLength: 1,
        maxPathLength: 3,
        minPathWeight: 0,
        maxPathWeight: Number.MAX_SAFE_INTEGER,
        pathWeight: 'length',
        maxPaths: 1,
        order: 'desc',
      }, [compileStepWeighting('1')])
      expect(snapshottify(paths)).toMatchInlineSnapshot(`
        [
          {
            "stepWeights": [
              1,
              1,
            ],
            "steps": [
              "a",
              "b",
              "c",
            ],
            "weight": 2,
          },
        ]
      `)
    })

    it('can require a minimum path length', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        minPathLength: 2,
        maxPathLength: 3,
        minPathWeight: 0,
        maxPathWeight: Number.MAX_SAFE_INTEGER,
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
      }, [compileStepWeighting('1')])
      expect(snapshottify(paths)).toMatchInlineSnapshot(`
        [
          {
            "stepWeights": [
              1,
              1,
            ],
            "steps": [
              "a",
              "b",
              "c",
            ],
            "weight": 2,
          },
          {
            "stepWeights": [
              1,
              1,
            ],
            "steps": [
              "a",
              "b",
              "c",
            ],
            "weight": 2,
          },
        ]
      `)
    })

    it('can require a maximum path length', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        minPathLength: 1,
        maxPathLength: 1,
        minPathWeight: 0,
        maxPathWeight: Number.MAX_SAFE_INTEGER,
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
      }, [compileStepWeighting('1')])
      expect(snapshottify(paths)).toMatchInlineSnapshot(`
        [
          {
            "stepWeights": [
              1,
            ],
            "steps": [
              "a",
              "b",
            ],
            "weight": 1,
          },
          {
            "stepWeights": [
              1,
            ],
            "steps": [
              "a",
              "b",
            ],
            "weight": 1,
          },
          {
            "stepWeights": [
              1,
            ],
            "steps": [
              "b",
              "c",
            ],
            "weight": 1,
          },
        ]
      `)
    })

    it('support zero-length paths', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        minPathLength: 0,
        maxPathLength: 0,
        minPathWeight: 0,
        maxPathWeight: Number.MAX_SAFE_INTEGER,
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
      }, [compileStepWeighting('1')])
      expect(snapshottify(paths)).toMatchInlineSnapshot(`
        [
          {
            "stepWeights": [],
            "steps": [
              "root",
            ],
            "weight": 0,
          },
          {
            "stepWeights": [],
            "steps": [
              "a",
            ],
            "weight": 0,
          },
          {
            "stepWeights": [],
            "steps": [
              "b",
            ],
            "weight": 0,
          },
          {
            "stepWeights": [],
            "steps": [
              "c",
            ],
            "weight": 0,
          },
        ]
      `)
    })
  })

  describe('weighting', () => {
    describe('step weighting', () => {
      it('applies simple weighting', () => {
        const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 2,
          maxPathLength: 3,
          minPathWeight: 0,
          maxPathWeight: Number.MAX_SAFE_INTEGER,
          pathWeight: 'length',
          maxPaths: -1,
          order: 'desc',
        }, [compileStepWeighting('2')])
        expect(snapshottify(paths).map(({ stepWeights }) => stepWeights)).toEqual([[2, 2]])
      })

      it('can apply conditional weighting', () => {
        const model = createTestModel(['a', 'b', 'c', 'd', 'e'], [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 2,
          maxPathLength: 4,
          minPathWeight: 0,
          maxPathWeight: Number.MAX_SAFE_INTEGER,
          pathWeight: 'length',
          maxPaths: 1,
          order: 'desc',
        }, ['@path.step = 1 >>> 2', '@path.step = 2 >>> 2.5', '@path.step = 3 >>> -42', '@path.step = 4 >>> -7,7'].map(compileStepWeighting))
        expect(snapshottify(paths).map(({ stepWeights }) => stepWeights)).toEqual([[2, 2.5, -42, -7.7]])
      })

      it('is one by default', () => {
        const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 2,
          maxPathLength: 3,
          minPathWeight: 0,
          maxPathWeight: Number.MAX_SAFE_INTEGER,
          pathWeight: 'length',
          maxPaths: -1,
          order: 'desc',
        }, [])
        expect(snapshottify(paths).map(({ stepWeights }) => stepWeights)).toEqual([[1, 1]])
      })
    })

    describe('path weighting', () => {
      it('can use length weighting', () => {
        const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 1,
          maxPathLength: 3,
          minPathWeight: 0,
          maxPathWeight: Number.MAX_SAFE_INTEGER,
          pathWeight: 'length',
          maxPaths: -1,
          order: 'desc',
        }, [compileStepWeighting('1')])
        expect(snapshottify(paths).map(({ weight }) => weight)).toEqual([2, 1, 1])
      })

      it('can use step-product weighting', () => {
        const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 1,
          maxPathLength: 2,
          minPathWeight: 0,
          maxPathWeight: Number.MAX_SAFE_INTEGER,
          pathWeight: 'step-product',
          maxPaths: -1,
          order: 'desc',
        }, ['@source.id = a >>> 3', '2'].map(compileStepWeighting))
        expect(snapshottify(paths).map(({ weight }) => weight)).toEqual([6, 3, 2])
      })

      it('can use step-sum weighting', () => {
        const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 1,
          maxPathLength: 2,
          minPathWeight: 0,
          maxPathWeight: Number.MAX_SAFE_INTEGER,
          pathWeight: 'step-sum',
          maxPaths: -1,
          order: 'desc',
        }, ['@source.id = a >>> 3', '2'].map(compileStepWeighting))
        expect(snapshottify(paths).map(({ weight }) => weight)).toEqual([5, 3, 2])
      })

      it('can set a minimum path-weight', () => {
        const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 1,
          maxPathLength: 1,
          minPathWeight: 3,
          maxPathWeight: Number.MAX_SAFE_INTEGER,
          pathWeight: 'step-sum',
          maxPaths: -1,
          order: 'desc',
        }, ['@source.id = a >>> 3', '2'].map(compileStepWeighting))
        expect(snapshottify(paths).map(({ weight }) => weight)).toEqual([3])
      })

      it('can set a maximum path-weight', () => {
        const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])
        const paths = collectPaths(model, {
          allowCycles: false,
          minPathLength: 1,
          maxPathLength: 1,
          minPathWeight: 0,
          maxPathWeight: 2,
          pathWeight: 'step-sum',
          maxPaths: -1,
          order: 'desc',
        }, ['@source.id = a >>> 3', '2'].map(compileStepWeighting))
        expect(snapshottify(paths).map(({ weight }) => weight)).toEqual([2])
      })
    })
  })
})
