import { GraphModel } from '@cm2ml/ir'
import { batch } from '@cm2ml/plugin'
import { describe, expect, it } from 'vitest'

import { FeatureEncoder } from '../src/index'

describe('feature encoder', () => {
  it('encodes features', () => {
    const firstModel = new GraphModel({
      idAttribute: 'id',
      debug: false,
      strict: true,
    }, 'first')
    firstModel.root.addAttribute({ name: 'a', type: 'category', value: { literal: 'a-1' } })
    firstModel.root.addAttribute({ name: 'b', type: 'category', value: { literal: 'b-1' } })

    const secondModel = new GraphModel({
      idAttribute: 'id',
      debug: false,
      strict: true,
    }, 'second')
    secondModel.root.addAttribute({ name: 'a', type: 'category', value: { literal: 'a-2' } })
    secondModel.root.addAttribute({ name: 'b', type: 'string', value: { literal: 'b-2' } })

    const [firstResult, secondResult] = batch(FeatureEncoder)
      .validateAndInvoke([firstModel, secondModel], {
        rawFeatures: false,
        onlyEncodedFeatures: false,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: false,
        nodeFeatures: '',
        edgeFeatures: '',
      })

    expect(firstResult).toBeDefined()
    expect(secondResult).toBeDefined()

    expect(firstResult!.features).toBe(secondResult!.features)
    expect(firstResult!.features.nodeFeatures).toMatchInlineSnapshot(`
      [
        [
          "a",
          "encoded-category",
          {
            "a-1": 1,
            "a-2": 2,
          },
        ],
        [
          "b",
          "encoded-category",
          {
            "b-1": 1,
          },
        ],
        [
          "b",
          "encoded-string",
          {
            "b-2": 1,
          },
        ],
      ]
    `)

    const firstFeatureVector = firstResult!.features.getNodeFeatureVector(firstResult!.input.root)
    expect(firstFeatureVector).toEqual([
      1,
      1,
      0,
    ])
    const secondFeatureVector = secondResult!.features.getNodeFeatureVector(secondResult!.input.root)
    expect(secondFeatureVector).toEqual([
      2,
      0,
      1,
    ])
  })

  it('loads feature overrides', () => {
    const firstModel = new GraphModel({
      idAttribute: 'id',
      debug: false,
      strict: true,
    }, 'first')
    firstModel.root.addAttribute({ name: 'a', type: 'category', value: { literal: 'a-1' } })
    firstModel.root.addAttribute({ name: 'b', type: 'category', value: { literal: 'b-1' } })
    firstModel.root.addAttribute({ name: 'c', type: 'category', value: { literal: 'c-1' } })

    const result = FeatureEncoder
      .validateAndInvoke(firstModel, {
        rawFeatures: false,
        onlyEncodedFeatures: false,
        rawCategories: false,
        rawBooleans: false,
        rawNumerics: false,
        rawStrings: false,
        nodeFeatures: '[["a", "encoded-category", { "a-0": 1, "a-2": 2 }], ["b", "category", { "b-1": 2, "b-2": 1 }], ["d", "boolean", null]]',
        edgeFeatures: '',
      })

    expect(result.features.nodeFeatures).toMatchInlineSnapshot(`
      [
        [
          "a",
          "category",
          {
            "a-0": 1,
            "a-1": 3,
            "a-2": 2,
          },
        ],
        [
          "b",
          "category",
          {
            "b-1": 2,
            "b-2": 1,
          },
        ],
        [
          "d",
          "boolean",
          null,
        ],
      ]
    `)

    const featureVector = result.features.getNodeFeatureVector(result.input.root)
    expect(featureVector).toEqual([3, 2, 0])
  })
})
