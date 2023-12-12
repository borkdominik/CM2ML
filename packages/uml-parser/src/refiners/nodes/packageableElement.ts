import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../../uml'
import { UmlElement } from '../refiner'

export class PackageableElement extends UmlElement {
  public isApplicable(node: GraphNode) {
    return node.tag === Uml.Tags.packagedElement || super.isApplicable(node)
  }

  public refine(node: GraphNode) {
    super.refine(node)
    // TODO
  }
}
