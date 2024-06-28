import { Metamodel } from '@cm2ml/ir'

const Attributes = {
  'xsi:id': 'xsi:id',
  // TODO/Ecore: Is this the correct type?
  'xsi:type': 'xsi:type',
} as const

export type EcoreAttribute = keyof typeof Attributes

const Tags = {} as const

export type EcoreTag = (typeof Tags)[keyof typeof Tags]

const Types = {} as const

export type EcoreType = (typeof Types)[keyof typeof Types]

const AbstractTypes = {} as const

export type EcoreAbstractType = (typeof AbstractTypes)[keyof typeof AbstractTypes]

export const Ecore = new class extends Metamodel<EcoreAttribute, EcoreType, EcoreTag> {
  public constructor() {
    super({
      Attributes,
      idAttribute: Attributes['xsi:id'],
      Tags,
      Types,
      typeAttributes: [Attributes['xsi:type']],
    })
  }
}()
