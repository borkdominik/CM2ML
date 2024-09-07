import { describe, expect, it } from 'vitest'

import { collectPaths } from '../src/paths'

import { createTestModel } from './test-utils'

describe('paths', () => {
  it('does not include duplicates', () => {
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
    const paths = collectPaths(model, {
      allowCycles: false,
      includeSubpaths: false,
      minPathLength: 1,
      maxPathLength: 3,
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
      nodeTemplates: [],
    })
    expect(paths).toMatchInlineSnapshot(`
      [
        {
          "encodedSteps": [
            null,
            null,
            null,
          ],
          "stepWeights": [
            2,
            1,
          ],
          "steps": [
            1,
            2,
            3,
          ],
          "weight": 2,
        },
        {
          "encodedSteps": [
            null,
            null,
          ],
          "stepWeights": [
            1,
          ],
          "steps": [
            2,
            3,
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
      includeSubpaths: false,
      minPathLength: 1,
      maxPathLength: 3,
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
      nodeTemplates: [],
    })
    expect(paths.map(({ steps }) => steps)).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          1,
          2,
        ],
        [
          2,
          1,
          2,
          1,
        ],
        [
          2,
          1,
          2,
          3,
        ],
        [
          1,
          2,
          3,
        ],
        [
          2,
          3,
        ],
      ]
    `)
  })

  it('can include subpaths', () => {
    const model = createTestModel(['a', 'b', 'c', 'd'], [['a', 'b'], ['b', 'c'], ['c', 'd']])
    const paths = collectPaths(model, {
      allowCycles: false,
      includeSubpaths: true,
      minPathLength: 1,
      maxPathLength: 3,
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
      nodeTemplates: [],
    })
    expect(paths.map(({ steps }) => steps)).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          3,
          4,
        ],
        [
          1,
          2,
          3,
        ],
        [
          2,
          3,
          4,
        ],
        [
          1,
          2,
        ],
        [
          2,
          3,
        ],
        [
          3,
          4,
        ],
      ]
    `)
  })

  it('can include subpaths with cycles', () => {
    const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['b', 'a'], ['b', 'c']])
    const paths = collectPaths(model, {
      allowCycles: true,
      includeSubpaths: true,
      minPathLength: 1,
      maxPathLength: 3,
      stepWeight: 'edge-count',
      pathWeight: 'length',
      maxPaths: -1,
      order: 'desc',
      nodeTemplates: [],
    })
    expect(paths.map(({ steps }) => steps)).toMatchInlineSnapshot(`
      [
        [
          1,
          2,
          1,
          2,
        ],
        [
          2,
          1,
          2,
          1,
        ],
        [
          2,
          1,
          2,
          3,
        ],
        [
          1,
          2,
          1,
        ],
        [
          1,
          2,
          3,
        ],
        [
          2,
          1,
          2,
        ],
        [
          1,
          2,
        ],
        [
          2,
          1,
        ],
        [
          2,
          3,
        ],
      ]
    `)
  })

  describe('filtering', () => {
    it('can limit the number of paths', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        includeSubpaths: false,
        minPathLength: 1,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: 1,
        order: 'desc',
        nodeTemplates: [],
      })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "encodedSteps": [
              null,
              null,
              null,
            ],
            "stepWeights": [
              2,
              1,
            ],
            "steps": [
              1,
              2,
              3,
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
        includeSubpaths: false,
        minPathLength: 2,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
        nodeTemplates: [],
      })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "encodedSteps": [
              null,
              null,
              null,
            ],
            "stepWeights": [
              2,
              1,
            ],
            "steps": [
              1,
              2,
              3,
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
        includeSubpaths: false,
        minPathLength: 1,
        maxPathLength: 1,
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
        nodeTemplates: [],
      })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "encodedSteps": [
              null,
              null,
            ],
            "stepWeights": [
              2,
            ],
            "steps": [
              1,
              2,
            ],
            "weight": 1,
          },
          {
            "encodedSteps": [
              null,
              null,
            ],
            "stepWeights": [
              1,
            ],
            "steps": [
              2,
              3,
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
        includeSubpaths: false,
        minPathLength: 0,
        maxPathLength: 0,
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
        nodeTemplates: [],
      })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "encodedSteps": [
              null,
            ],
            "stepWeights": [],
            "steps": [
              0,
            ],
            "weight": 0,
          },
          {
            "encodedSteps": [
              null,
            ],
            "stepWeights": [],
            "steps": [
              1,
            ],
            "weight": 0,
          },
          {
            "encodedSteps": [
              null,
            ],
            "stepWeights": [],
            "steps": [
              2,
            ],
            "weight": 0,
          },
          {
            "encodedSteps": [
              null,
            ],
            "stepWeights": [],
            "steps": [
              3,
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
        includeSubpaths: false,
        minPathLength: 2,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'length',
        maxPaths: -1,
        order: 'desc',
        nodeTemplates: [],
      })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "encodedSteps": [
              null,
              null,
              null,
            ],
            "stepWeights": [
              2,
              1,
            ],
            "steps": [
              1,
              2,
              3,
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
        includeSubpaths: false,
        minPathLength: 2,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'step-product',
        maxPaths: -1,
        order: 'desc',
        nodeTemplates: [],
      })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "encodedSteps": [
              null,
              null,
              null,
            ],
            "stepWeights": [
              2,
              2,
            ],
            "steps": [
              1,
              2,
              3,
            ],
            "weight": 4,
          },
        ]
      `)
    })

    it('can use step-sum weighting', () => {
      const model = createTestModel(['a', 'b', 'c'], [['a', 'b'], ['a', 'b'], ['b', 'c']])
      const paths = collectPaths(model, {
        allowCycles: false,
        includeSubpaths: false,
        minPathLength: 2,
        maxPathLength: 3,
        stepWeight: 'edge-count',
        pathWeight: 'step-sum',
        maxPaths: -1,
        order: 'desc',
        nodeTemplates: [],
      })
      expect(paths).toMatchInlineSnapshot(`
        [
          {
            "encodedSteps": [
              null,
              null,
              null,
            ],
            "stepWeights": [
              2,
              1,
            ],
            "steps": [
              1,
              2,
              3,
            ],
            "weight": 3,
          },
        ]
      `)
    })
  })
})
