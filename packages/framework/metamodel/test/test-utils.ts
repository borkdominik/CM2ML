import { Metamodel } from '@cm2ml/ir'

const attributes = ['id', 'name', 'type'] as const
const types = ['A', 'B'] as const
const tags = ['a', 'b'] as const

export const testMetamodel = new class extends Metamodel<typeof attributes[number], typeof types[number], typeof tags[number]> {
  public constructor() {
    super({
      attributes,
      idAttribute: 'id',
      types,
      typeAttributes: ['type'],
      nameAttribute: 'name',
      tags,
    })
  }
}()
