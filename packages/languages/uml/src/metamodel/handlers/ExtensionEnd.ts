import type { GraphNode } from '@cm2ml/ir'

import { ExtensionEnd } from '../uml-metamodel'

export const ExtensionEndHandler = ExtensionEnd.createHandler(
  (extensionEnd, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_type(extensionEnd)
  },
)

function addEdge_type(_extensionEnd: GraphNode) {
  // TODO/Association
  // type : Stereotype [1..1]{redefines TypedElement::type} (opposite A_type_extensionEnd::extensionEnd)
  // References the type of the ExtensionEnd. Note that this association restricts the possible types of an ExtensionEnd to only be Stereotypes.
}
