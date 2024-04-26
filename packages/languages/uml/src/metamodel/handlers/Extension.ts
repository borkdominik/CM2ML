import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Class, Extension, ExtensionEnd, Property } from '../uml-metamodel'

export const ExtensionHandler = Extension.createHandler(
  (extension, { onlyContainmentAssociations }) => {
    // Do not remove attributes, because they are needed for the Association generalization
    const memberEnds = resolve(extension, 'memberEnd', { removeAttribute: false, many: true, type: Property })
    const ownedEnd = resolve(extension, 'ownedEnd', { removeAttribute: false, type: ExtensionEnd })
    deriveAttribute_isRequired(extension, ownedEnd)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_metaclass(extension, memberEnds, ownedEnd)
    addEdge_ownedEnd(extension, ownedEnd)
  },
  {
    [Uml.Attributes.isRequired]: { type: 'boolean' },
  },
)

function deriveAttribute_isRequired(extension: GraphNode, ownedEnd: GraphNode | undefined) {
  if (!ownedEnd) {
    return
  }
  const lower = ownedEnd.getAttribute(Uml.Attributes.lower)?.value.literal
  const value = lower === '1' ? 'true' : 'false'
  extension.addAttribute({ name: Uml.Attributes.isRequired, type: 'boolean', value: { literal: value } })
}

function addEdge_metaclass(extension: GraphNode, memberEnds: GraphNode[], ownedEnd: GraphNode | undefined) {
  // /metaclass : Class [1..1]{} (opposite Class::extension)
  // References the Class that is extended through an Extension. The property is derived from the type of the memberEnd that is not the ownedEnd.
  const metaclass = memberEnds.find((memberEnd) => memberEnd !== ownedEnd)
  if (!metaclass) {
    return
  }
  extension.model.addEdge('metaclass', extension, metaclass)
  if (Class.isAssignable(metaclass)) {
    metaclass.model.addEdge('extension', metaclass, extension)
  }
}

function addEdge_ownedEnd(extension: GraphNode, ownedEnd: GraphNode | undefined) {
  // ♦ ownedEnd : ExtensionEnd [1..1]{redefines Association::ownedEnd} (opposite A_ownedEnd_extension::extension)
  // References the end of the extension that is typed by a Stereotype.
  if (!ownedEnd) {
    return
  }
  extension.model.addEdge('ownedEnd', extension, ownedEnd)
  ownedEnd.model.addEdge('extension', ownedEnd, extension)
}
