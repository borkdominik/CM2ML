import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { addEdge_relatedElement } from '../resolvers/relatedElement'
import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { Constraint, Extend, ExtensionPoint, UseCase } from '../uml-metamodel'

export const ExtendHandler = Extend.createHandler(
  (extend, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const condition = resolve(extend, 'condition', { type: Constraint })
    const extendedCase = resolve(extend, 'extendedCase', { type: UseCase })
    const extension = resolve(extend, 'extension', { type: UseCase }) ?? getParentOfType(extend, UseCase)
    const extensionLocations = resolve(extend, 'extensionLocation', { many: true, type: ExtensionPoint })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(extend, extension, extendedCase)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_condition(extend, condition)
    addEdge_extendedCase(extend, extendedCase)
    addEdge_extension(extend, extension)
    addEdge_extensionLocation(extend, extensionLocations)
    addEdge_relatedElement(extend, extendedCase, extension)
  },
)

function addEdge_condition(extend: GraphNode, condition: GraphNode | undefined) {
  // ♦ condition : Constraint [0..1]{subsets Element::ownedElement} (opposite A_condition_extend::extend)
  // References the condition that must hold when the first ExtensionPoint is reached for the extension to take place. If no constraint is associated with the Extend relationship, the extension is unconditional.
  if (!condition) {
    return
  }
  extend.model.addEdge('condition', extend, condition)
}

function addEdge_extendedCase(extend: GraphNode, extendedCase: GraphNode | undefined) {
  // extendedCase : UseCase [1..1]{subsets DirectedRelationship::target} (opposite A_extendedCase_extend::extend)
  // The UseCase that is being extended.
  if (!extendedCase) {
    return
  }
  extend.model.addEdge('extendedCase', extend, extendedCase)
  extend.model.addEdge('target', extend, extendedCase)
}

function addEdge_extension(extend: GraphNode, extension: GraphNode | undefined) {
  // extension : UseCase [1..1]{subsets NamedElement::namespace, subsets DirectedRelationship::source} (opposite UseCase::extend)
  // The UseCase that represents the extension and owns the Extend relationship.
  if (!extension) {
    return
  }
  extend.model.addEdge('extension', extend, extension)
  extend.model.addEdge('source', extend, extension)
}

function addEdge_extensionLocation(extend: GraphNode, extensionLocations: GraphNode[]) {
  // extensionLocation : ExtensionPoint [1..*]{ordered} (opposite A_extensionLocation_extension::extension)
  // An ordered list of ExtensionPoints belonging to the extended UseCase, specifying where the respective behavioral fragments of the extending UseCase are to be inserted. The first fragment in the extending UseCase is associated with the first extension point in the list, the second fragment with the second point, and so on. Note that, in most practical cases, the extending UseCase has just a single behavior fragment, so that the list of ExtensionPoints is trivial.
  extensionLocations.forEach((extensionLocation) => {
    extend.model.addEdge('extensionLocation', extend, extensionLocation)
  })
}
