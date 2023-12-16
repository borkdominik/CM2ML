import { Uml } from '../uml'

import { Element } from './element'
import { Parameter } from './parameter'

// TODO
export const Operation = Element.extend(
  (node) =>
    Uml.getType(node) === Uml.Types.Operation ||
    node.tag === Uml.Tags.ownedOperation,
  (node) => {
    const parent = node.parent
    if (!parent) {
      throw new Error('OwnedOperation must have a parent')
    }
    node.model.addEdge('ownedOperation', parent, node)
    node.children.forEach((child) => {
      if (Parameter.isAssignable(child)) {
        node.model.addEdge('ownedParameter', node, child)
      }
    })
    node.tag = Uml.Types.Operation
  },
)
