import type { GraphNode } from '@cm2ml/ir'

import { Archimate, typeToLayerMap } from '../archimate'
import { Element } from '../archimate-metamodel'

export const ElementHandler = Element.createHandler(
  (element) => {
    setLayer(element)
  },
)

function setLayer(element: GraphNode) {
  const type = element.getAttribute(Archimate.Attributes['xsi:type'])?.value.literal
  if (type) {
    const layer = typeToLayerMap[type]
    if (layer) {
      element.addAttribute({ name: Archimate.Attributes.layer, type: 'string', value: { literal: layer } }, false)
    }
  }
}
