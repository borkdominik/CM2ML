import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { MultiplicityElement, ValueSpecification } from '../uml-metamodel'

export const MultiplicityElementHandler = MultiplicityElement.createHandler(
  (multiplicityElement, { onlyContainmentAssociations }) => {
    const lowerValue = resolve(multiplicityElement, 'lowerValue', { type: ValueSpecification })
    const upperValue = resolve(multiplicityElement, 'upperValue', { type: ValueSpecification })
    setAttribute_lower(multiplicityElement, lowerValue)
    setAttribute_upper(multiplicityElement, upperValue)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_lowerValue(multiplicityElement, lowerValue)
    addEdge_upperValue(multiplicityElement, upperValue)
  },
  {
    [Uml.Attributes.isOrdered]: 'false',
    [Uml.Attributes.isUnique]: 'true',
  },
)

function setAttribute_lower(multiplicityElement: GraphNode, lowerValue: GraphNode | undefined) {
  if (!lowerValue) {
    return
  }
  const value = lowerValue.getAttribute(Uml.Attributes.value)?.value.literal
  if (value === undefined) {
    return
  }
  multiplicityElement.addAttribute({
    name: Uml.Attributes.lower,
    value: { literal: value },
  })
}

function setAttribute_upper(multiplicityElement: GraphNode, upperValue: GraphNode | undefined) {
  if (!upperValue) {
    return
  }
  const value = upperValue.getAttribute(Uml.Attributes.value)?.value.literal
  if (value === undefined) {
    return
  }
  multiplicityElement.addAttribute({
    name: Uml.Attributes.upper,
    value: { literal: value },
  })
}

function addEdge_lowerValue(multiplicityElement: GraphNode, lowerValue: GraphNode | undefined) {
  if (!lowerValue) {
    return
  }
  multiplicityElement.model.addEdge(
    'lowerValue',
    multiplicityElement,
    lowerValue,
  )
}

function addEdge_upperValue(multiplicityElement: GraphNode, upperValue: GraphNode | undefined) {
  if (!upperValue) {
    return
  }
  multiplicityElement.model.addEdge(
    'upperValue',
    multiplicityElement,
    upperValue,
  )
}
