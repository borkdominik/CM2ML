import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType, transformNodeToEdge } from '@cm2ml/metamodel'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Extend, UseCase } from '../uml-metamodel'

export const ExtendHandler = Extend.createHandler(
  (extend, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const extendedCase = resolveFromAttribute(extend, 'extendedCase')
    const extension = getParentOfType(extend, UseCase)
    const extensionLocations = resolveFromAttribute(extend, 'extensionLocation', { many: true })
    if (relationshipsAsEdges) {
      // TODO/Jan: Validate direction
      transformNodeToEdge(extend, extension, extendedCase, 'extend')
      return false
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_condition(extend)
    addEdge_extendedCase(extend, extendedCase)
    addEdge_extension(extend, extension)
    addEdge_extensionLocation(extend, extensionLocations)
  },
)

function addEdge_condition(_extend: GraphNode) {
  // TODO/Association
  // ♦ condition : Constraint [0..1]{subsets Element::ownedElement} (opposite A_condition_extend::extend)
  // References the condition that must hold when the first ExtensionPoint is reached for the extension to take place. If no constraint is associated with the Extend relationship, the extension is unconditional.
}

function addEdge_extendedCase(extend: GraphNode, extendedCase: GraphNode | undefined) {
  // extendedCase : UseCase [1..1]{subsets DirectedRelationship::target} (opposite A_extendedCase_extend::extend)
  // The UseCase that is being extended.
  if (!extendedCase) {
    return
  }
  extend.model.addEdge('extendedCase', extend, extendedCase)
}

function addEdge_extension(extend: GraphNode, extension: GraphNode | undefined) {
  // extension : UseCase [1..1]{subsets NamedElement::namespace, subsets DirectedRelationship::source} (opposite UseCase::extend)
  // The UseCase that represents the extension and owns the Extend relationship.
  if (!extension) {
    return
  }
  extend.model.addEdge('extension', extend, extension)
}

function addEdge_extensionLocation(extend: GraphNode, extensionLocations: GraphNode[]) {
  // extensionLocation : ExtensionPoint [1..*]{ordered} (opposite A_extensionLocation_extension::extension)
  // An ordered list of ExtensionPoints belonging to the extended UseCase, specifying where the respective behavioral fragments of the extending UseCase are to be inserted. The first fragment in the extending UseCase is associated with the first extension point in the list, the second fragment with the second point, and so on. Note that, in most practical cases, the extending UseCase has just a single behavior fragment, so that the list of ExtensionPoints is trivial.
  extensionLocations.forEach((extensionLocation) => {
    extend.model.addEdge('extensionLocation', extend, extensionLocation)
  })
}
