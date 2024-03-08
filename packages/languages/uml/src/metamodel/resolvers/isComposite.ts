import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'

export function isCompositeProperty(property: GraphNode): boolean {
  return property.getAttribute(Uml.Attributes.aggregation)?.value.literal === 'composite'
}
