import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { MultiplicityElement, ValueSpecification } from '../uml-metamodel'

export const MultiplicityElementHandler = MultiplicityElement.createHandler(
  (multiplicityElement, { onlyContainmentAssociations }) => {
    const lowerValue = resolve(multiplicityElement, 'lowerValue', { type: ValueSpecification })
    const upperValue = resolve(multiplicityElement, 'upperValue', { type: ValueSpecification })
    deriveAttribute_lower(multiplicityElement, lowerValue)
    deriveAttribute_upper(multiplicityElement, upperValue)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_lowerValue(multiplicityElement, lowerValue)
    addEdge_upperValue(multiplicityElement, upperValue)
  },
  {
    [Uml.Attributes.isOrdered]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isUnique]: { type: 'boolean', defaultValue: 'true' },
    [Uml.Attributes.lower]: { type: 'integer' },
    [Uml.Attributes.upper]: { type: 'integer' },
  },
)

function deriveAttribute_lower(multiplicityElement: GraphNode, lowerValue: GraphNode | undefined) {
  if (!lowerValue) {
    return
  }
  const value = lowerValue.getAttribute(Uml.Attributes.value)?.value.literal
  if (value === undefined) {
    return
  }
  multiplicityElement.addAttribute({
    name: Uml.Attributes.lower,
    type: 'integer',
    value: { literal: value },
  })
}

function deriveAttribute_upper(multiplicityElement: GraphNode, upperValue: GraphNode | undefined) {
  if (!upperValue) {
    return
  }
  const value = upperValue.getAttribute(Uml.Attributes.value)?.value.literal
  if (value === undefined) {
    return
  }
  multiplicityElement.addAttribute({
    name: Uml.Attributes.upper,
    type: 'integer',
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
