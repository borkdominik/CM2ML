import { GraphModel, Metamodel } from '@cm2ml/ir'
import { describe, expect, it } from 'vitest'

import { IrPostProcessor } from '../src'

describe('type unification', () => {
  it('can unify types', () => {
    const metamodel = new Metamodel({
      attributes: ['id', 'a', 'b'],
      idAttribute: 'id',
      types: ['cat', 'dog'],
      typeAttributes: ['a', 'b'],
      tags: ['root', 'animal', 'none'],
    })
    const testModel = new GraphModel(metamodel, {
      debug: false,
      strict: true,
    })

    const root = testModel.createRootNode('root')
    root.id = 'root'
    expect(root.getAttribute('a')).toBeUndefined()
    expect(root.getAttribute('b')).toBeUndefined()

    const dog = testModel.addNode('dog')
    dog.id = 'dog'
    dog.addAttribute({ name: 'a', value: { literal: 'dog' }, type: 'category' })
    expect(dog.getAttribute('b')).toBeUndefined()

    const cat = testModel.addNode('cat')
    cat.id = 'cat'
    cat.addAttribute({ name: 'b', value: { literal: 'cat' }, type: 'category' })
    expect(cat.getAttribute('a')).toBeUndefined()

    IrPostProcessor.invoke(testModel, { edgeTagAsAttribute: false, nodeTagAsAttribute: false, unifyTypes: true })

    expect(root.type).toBeUndefined()
    expect(root.getAttribute('a')).toBeUndefined()
    expect(root.getAttribute('b')).toBeUndefined()

    expect(dog.type).toBe('dog')
    expect(dog.getAttribute('b')).toBeUndefined()

    expect(cat.type).toBe('cat')
    expect(cat.getAttribute('b')).toBeUndefined()
  })
})
