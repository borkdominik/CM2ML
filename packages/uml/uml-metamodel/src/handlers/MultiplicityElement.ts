import type { GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'
import { MultiplicityElement } from '../uml-metamodel'

export const MultiplicityElementHandler = MultiplicityElement.createHandler(
  (multiplicityElement, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdgeAndAttribute_lowerValue(multiplicityElement)
    addEdgeAndAttribute_upperValue(multiplicityElement)
  },
  {
    [Uml.Attributes.isOrdered]: 'false',
    [Uml.Attributes.isUnique]: 'true',
  },
)

function addEdgeAndAttribute_lowerValue(multiplicityElement: GraphNode) {
  const lowerValueNode = Stream.from(multiplicityElement.children).find(
    (child) => child.tag === Uml.Tags.lowerValue,
  )
  if (!lowerValueNode) {
    return
  }
  multiplicityElement.model.addEdge(
    'lowerValue',
    multiplicityElement,
    lowerValueNode,
  )
  const lowerValue = lowerValueNode.getAttribute(Uml.Attributes.value)?.value
    .literal
  if (lowerValue === undefined) {
    throw new Error('LowerValue must have a value')
  }
  multiplicityElement.addAttribute({
    name: Uml.Attributes.lower,
    value: { literal: lowerValue },
  })
}

function addEdgeAndAttribute_upperValue(multiplicityElement: GraphNode) {
  const upperValueNode = Stream.from(multiplicityElement.children).find(
    (child) => child.tag === Uml.Tags.upperValue,
  )
  if (!upperValueNode) {
    return
  }
  multiplicityElement.model.addEdge(
    'upperValue',
    multiplicityElement,
    upperValueNode,
  )
  const upperValue = upperValueNode.getAttribute(Uml.Attributes.value)?.value
    .literal
  if (upperValue === undefined) {
    throw new Error('UpperValue must have a value')
  }
  multiplicityElement.addAttribute({
    name: Uml.Attributes.upper,
    value: { literal: upperValue },
  })
}
