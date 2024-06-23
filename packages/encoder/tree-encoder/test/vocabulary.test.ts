import { describe, expect, it } from 'vitest'

import type { TreeModel } from '../src'
import type { LocalRootNode } from '../src/tree-transformer/local-tree-transformer'
import { getVocabularies } from '../src/vocabulary'

describe('vocabulary', () => {
  it('should return the static and dynamic vocabularies', () => {
    const inputTrees: TreeModel<LocalRootNode>[] = [
      {
        format: 'local',
        numNodes: -1,
        idMapping: {},
        root: {
          value: 'MODEL',
          isStaticNode: true,
          children: [
            {
              value: 'CLS',
              isStaticNode: true,
              children: [
                {
                  value: 'NAME',
                  isStaticNode: true,
                  children: [
                    {
                      value: 'a',
                      isStaticNode: false,
                      children: [],
                    },
                  ],
                },
                {
                  value: 'ATTRS',
                  isStaticNode: true,
                  children: [
                    {
                      value: 'a-attr',
                      isStaticNode: false,
                      children: [
                        {
                          value: 'a-attr-value',
                          isStaticNode: false,
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  value: 'ASSOCS',
                  isStaticNode: true,
                  children: [

                  ],
                },
              ],
            },
          ],
        },
      },
      {
        format: 'local',
        numNodes: -1,
        idMapping: {},
        root: {
          value: 'MODEL',
          isStaticNode: true,
          children: [
            {
              value: 'CLS',
              isStaticNode: true,
              children: [
                {
                  value: 'NAME',
                  isStaticNode: true,
                  children: [
                    {
                      value: 'a',
                      isStaticNode: false,
                      children: [],
                    },
                  ],
                },
                {
                  value: 'ATTRS',
                  isStaticNode: true,
                  children: [
                    {
                      value: 'a-attr',
                      isStaticNode: false,
                      children: [
                        {
                          value: 'a-b-attr-value',
                          isStaticNode: false,
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  value: 'ASSOCS',
                  isStaticNode: true,
                  children: [

                  ],
                },
              ],
            },
            {
              value: 'CLS',
              isStaticNode: true,
              children: [
                {
                  value: 'NAME',
                  isStaticNode: true,
                  children: [
                    {
                      value: 'b',
                      isStaticNode: false,
                      children: [],
                    },
                  ],
                },
                {
                  value: 'ATTRS',
                  isStaticNode: true,
                  children: [
                    {
                      value: 'b-attr',
                      isStaticNode: false,
                      children: [
                        {
                          value: 'b-attr-value',
                          isStaticNode: false,
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  value: 'ASSOCS',
                  isStaticNode: true,
                  children: [

                  ],
                },
              ],
            },
          ],
        },
      },
    ]
    expect(getVocabularies(inputTrees)).toMatchInlineSnapshot(`
      {
        "dynamicVocabulary": [
          "a",
          "a-attr",
          "a-attr-value",
          "a-b-attr-value",
          "b",
          "b-attr",
          "b-attr-value",
        ],
        "staticVocabulary": [
          "ASSOCS",
          "ATTRS",
          "CLS",
          "MODEL",
          "NAME",
        ],
        "vocabulary": [
          "ASSOCS",
          "ATTRS",
          "CLS",
          "MODEL",
          "NAME",
          "a",
          "a-attr",
          "a-attr-value",
          "a-b-attr-value",
          "b",
          "b-attr",
          "b-attr-value",
        ],
      }
    `)
  })
})
