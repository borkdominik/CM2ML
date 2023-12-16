import { Uml } from '../uml'

import { Element } from './element'

// TODO
export const TypedElement = Element.extend(
  () => false,
  (node) => {
    const type = node.getAttribute('type')?.value.literal
    if (type === undefined) {
      return
    }
    if (Uml.isValidType(type)) {
      return
    }
    const resolvedType = node.model.getNodeById(type)
    if (!resolvedType) {
      return
    }
    node.model.addEdge('type', node, resolvedType)
  },
)
