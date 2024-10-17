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

function getNodeTypes(model: GraphModel) {
  return Stream.from(model.nodes)
    .map((node) => node.type)
    .toSet()
}

const baseline = getNodeTypes(UmlParser.invoke(input, baseParameters))

describe('UML Nodes', () => {
  it('can be whitelisted', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, nodeWhitelist: ['Artifact'] })
    const nodeTypes = getNodeTypes(model)
    baseline.forEach((type) =>
      expect(nodeTypes.has(type)).toBe(type === 'Artifact' || type === model.root.type),
    )
  })

  it('can be blacklisted', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, nodeBlacklist: ['Artifact'] })
    const nodeTypes = getNodeTypes(model)
    expect([...nodeTypes.values()].sort()).toEqual([...baseline.values()].sort().filter((tag) => tag !== 'Artifact'))
  })

  it('can be whitelisted and blacklisted at the same time', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, nodeWhitelist: ['Artifact'], nodeBlacklist: ['Artifact'] })
    const nodeTypes = getNodeTypes(model)
    // Only the root remains
    expect(nodeTypes.size).toBe(1)
  })

  it('cannot remove the root of models', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, nodeWhitelist: ['Package'], nodeBlacklist: ['Model'] })
    const nodeTypes = getNodeTypes(model)
    expect(nodeTypes.size).toBe(1)
    expect(nodeTypes.has('Model')).toBe(true)
  })
})
