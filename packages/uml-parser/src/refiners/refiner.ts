import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'

export abstract class UmlElement {
  public isApplicable(_node: GraphNode): boolean {
    return false
  }

  public refine(node: GraphNode) {
    const type = Uml.getType(node)
    if (Uml.isValidType(type)) {
      node.tag = type
    }
  }
}
