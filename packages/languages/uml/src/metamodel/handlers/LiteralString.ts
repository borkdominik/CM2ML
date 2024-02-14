import type { GraphNode } from '@cm2ml/ir'

import { LiteralString } from '../uml-metamodel'

export const LiteralStringHandler = LiteralString.createHandler((literalString, { onlyContainmentAssociations }) => {
  setAttribute_value(literalString)
  if (onlyContainmentAssociations) {
    // return
  }
})

function setAttribute_value(literalString: GraphNode) {
  const valueChild = literalString.findChild((child) => child.tag === 'value')
  if (!valueChild) {
    return
  }
  const isNil = valueChild.getAttribute('xsi:nil')?.value.literal === 'true'
  literalString.model.removeNode(valueChild)
  if (isNil) {
    // return
  }
  // TODO: Parse an actual string value
  // literalString.addAttribute({ name: Uml.Attributes.value, value: { literal: 'TODO' } })
}
