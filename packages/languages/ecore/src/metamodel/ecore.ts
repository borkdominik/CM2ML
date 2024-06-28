import { Metamodel } from '@cm2ml/ir'

const attributes = [
  'xsi:id',
  // TODO/Ecore: Is this the correct type?
  'xsi:type',
] as const

export type EcoreAttribute = (typeof attributes)[number]

export type EcoreTag = never

const types = [] as const

export type EcoreType = (typeof types)[number]

const AbstractTypes = {} as const

export type EcoreAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

export const Ecore = new class extends Metamodel<EcoreAttribute, EcoreType, EcoreTag> {
  public constructor() {
    super({
      attributes,
      idAttribute: 'xsi:id',
      types,
      typeAttributes: ['xsi:type'],
      tags: [],

    })
  }
}()
