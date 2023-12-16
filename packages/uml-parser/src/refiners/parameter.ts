import { Uml } from '../uml'

import { ConnectableElement } from './connectableElement'
import { extendMultiple } from './element'
import { MultiplicityElement } from './multiplicityElement'

// TODO
export const Parameter = extendMultiple(
  [ConnectableElement, MultiplicityElement],
  (node) =>
    Uml.getType(node) === Uml.Types.Parameter ||
    node.tag === Uml.Tags.ownedParameter,
  (node) => {
    const parent = node.parent
    if (parent) {
      node.model.addEdge('operation', node, parent)
    }
    node.tag = Uml.Types.Parameter
  },
)
