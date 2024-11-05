import { GraphModel, Metamodel } from '@cm2ml/ir'

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

export function createTestModel() {
  const model = new GraphModel(testMetamodel, { debug: false, strict: true })

  const root = model.createRootNode('A')
  root.type = 'A'
  root.id = 'root'

  const b = model.addNode('B')
  b.type = 'B'
  b.id = 'b'
  root.addChild(b)

  const a = model.addNode('A')
  a.type = 'A'
  a.id = 'a'
  root.addChild(a)

  model.addEdge('edge', b, root).addAttribute({ name: 'edgeAttr', type: 'category', value: { literal: 'catB' } })
  model.addEdge('edge', a, b).addAttribute({ name: 'edgeAttr', type: 'category', value: { literal: 'catA' } })
  model.addEdge('edge', root, a).addAttribute({ name: 'secondEdgeAttr', type: 'category', value: { literal: 'catA' } })

  return model
}
