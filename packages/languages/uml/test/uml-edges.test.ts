import { readFileSync } from 'node:fs'

import type { GraphModel } from '@cm2ml/ir'
import type { InferParameters, ResolveParameters } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { describe, expect, it } from 'vitest'

import { UmlParser } from '../src'

import { umlModelDir } from './uml-test-utils'

const input = readFileSync(`${umlModelDir}/deployment.uml`, 'utf-8')

const baseParameters: ResolveParameters<InferParameters<typeof UmlParser>> = {
  strict: true,
  onlyContainmentAssociations: false,
  relationshipsAsEdges: false,
  nodeWhitelist: [],
  nodeBlacklist: [],
  edgeWhitelist: [],
  edgeBlacklist: [],
  attributeWhitelist: [],
  attributeBlacklist: [],
  randomizedIdPrefix: false,
  nodeTagAsAttribute: false,
  edgeTagAsAttribute: false,
  unifyTypes: false,
  debug: false,
}

function getEdgeTags(model: GraphModel) {
  return Stream.from(model.edges)
    .map((edge) => edge.tag)
    .toSet()
}

const baseline = getEdgeTags(UmlParser.invoke(input, baseParameters))

describe('UML Edges', () => {
  it('can be whitelisted', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, edgeWhitelist: ['owner'] })
    const edgeTags = getEdgeTags(model)
    baseline.forEach((tag) =>
      expect(edgeTags.has(tag)).toBe(tag === 'owner'),
    )
  })

  it('can be blacklisted', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, edgeBlacklist: ['client'] })
    const edgeTags = getEdgeTags(model)
    expect([...edgeTags.values()].sort()).toEqual([...baseline.values()].sort().filter((tag) => tag !== 'client'))
  })

  it('can be whitelisted and blacklisted at the same time', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, edgeWhitelist: ['name'], edgeBlacklist: ['name'] })
    const edgeTags = getEdgeTags(model)
    expect(edgeTags.size).toBe(0)
  })
})
