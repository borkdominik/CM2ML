import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'

import { ValueSpecification } from './valueSpecification'

// TODO
export const LowerValue = ValueSpecification.extend(
  (node) => node.tag === Uml.Tags.lowerValue,
  (node: GraphNode) => {
    const value = node.getAttribute('value')?.value.literal
    if (value === undefined) {
      throw new Error('LowerValue must have a value')
    }
    const parent = node.parent
    if (!parent) {
      throw new Error('LowerValue must have a parent')
    }
    parent.addAttribute({ name: 'lower', value: { literal: value } })
    node.model.addEdge('lowerValue', parent, node)
  },
)
