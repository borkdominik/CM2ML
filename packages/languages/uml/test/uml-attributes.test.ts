import { readFileSync } from 'node:fs'

import type { Attributable, GraphModel } from '@cm2ml/ir'
import type { InferParameters, ResolveParameters } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { describe, expect, it } from 'vitest'

import { UmlParser } from '../src'
import { Uml } from '../src/metamodel/uml'

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
  debug: false,
}

function getAttributes(model: GraphModel) {
  return Stream.from<Attributable>(model.nodes)
    .concat(model.edges)
    .flatMap((element) => element.attributes.values())
    .map((attribute) => attribute.name)
    .toSet()
}

const baseline = getAttributes(UmlParser.invoke(input, baseParameters))

describe('UML Attributes', () => {
  it('can be whitelisted', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, attributeWhitelist: ['name'] })
    const attributes = getAttributes(model)
    baseline.forEach((attribute) =>
      expect(attributes.has(attribute)).toBe(attribute === 'name' || attribute === Uml.idAttribute || Uml.typeAttributes.includes(attribute as any)),
    )
  })

  it('can be blacklisted', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, attributeBlacklist: ['name'] })
    const attributes = getAttributes(model)
    expect([...attributes.values()].sort()).toEqual([...baseline.values()].sort().filter((attribute) => attribute !== 'name'))
  })

  it('can be whitelisted and blacklisted at the same time', () => {
    const model = UmlParser.invoke(input, { ...baseParameters, attributeWhitelist: ['name'], attributeBlacklist: ['name'] })
    const attributes = getAttributes(model)
    // Just the type and id
    expect(attributes.size).toBe(2)
  })
})
