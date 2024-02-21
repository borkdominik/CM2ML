import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { Extension, ExtensionEnd } from '../uml-metamodel'

export const ExtensionHandler = Extension.createHandler(
  (extension, { onlyContainmentAssociations }) => {
    const ownedEnds = resolveFromChild(extension, 'ownedEnd', { many: true, type: ExtensionEnd })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_metaclass(extension)
    addEdge_ownedEnd(extension, ownedEnds)
  },
)

function addEdge_metaclass(_extension: GraphNode) {
  // TODO/Association
  // /metaclass : Class [1..1]{} (opposite Class::extension)
  // References the Class that is extended through an Extension. The property is derived from the type of the memberEnd that is not the ownedEnd.
}

function addEdge_ownedEnd(extension: GraphNode, ownedEnds: GraphNode[]) {
  // ♦ ownedEnd : ExtensionEnd [1..1]{redefines Association::ownedEnd} (opposite A_ownedEnd_extension::extension)
  // References the end of the extension that is typed by a Stereotype.
  ownedEnds.forEach((ownedEnd) => {
    extension.model.addEdge('ownedEnd', extension, ownedEnd)
    ownedEnd.model.addEdge('extension', ownedEnd, extension)
  })
}
