import { describe, expect, it } from 'vitest'

import type { PathData } from '../src/paths'
import { collectPaths } from '../src/paths'

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
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    })
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
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    })
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
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    })
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
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
    })
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
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: 1,
        order: 'desc',
      })
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
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
      })
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
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
      })
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
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
      })
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
    it('can use length weighting', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        minPathLength: 2,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
      })
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

    it('can use step-product weighting', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        minPathLength: 2,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'step-product',
        maxPaths: -1,
        order: 'desc',
      })
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
            "weight": 1,
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
            "weight": 1,
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
            "weight": 1,
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
            "weight": 1,
          },
        ]
      `)
    })

    it('can use step-sum weighting', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        minPathLength: 2,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'step-sum',
        maxPaths: -1,
        order: 'desc',
      })
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
  })
})
