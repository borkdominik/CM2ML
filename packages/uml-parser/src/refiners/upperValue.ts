import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'

import { ValueSpecification } from './valueSpecification'

// TODO
export const UpperValue = ValueSpecification.extend(
  (node) => node.tag === Uml.Tags.upperValue,
  (node: GraphNode) => {
    const value = node.getAttribute('value')?.value.literal
    if (value === undefined) {
      throw new Error('UpperValue must have a value')
    }
    const parent = node.parent
    if (!parent) {
      throw new Error('UpperValue must have a parent')
    }
    parent.addAttribute({ name: 'upper', value: { literal: value } })
    node.model.addEdge('upperValue', parent, node)
  },
)
