import type { GraphNode } from '@cm2ml/ir'

import { Extend } from '../uml-metamodel'

export const ExtendHandler = Extend.createHandler(
  (extend, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_condition(extend)
    addEdge_extendedCase(extend)
    addEdge_extension(extend)
    addEdge_extensionLocation(extend)
  },
)

function addEdge_condition(_extend: GraphNode) {
  // TODO/Association
  // ♦ condition : Constraint [0..1]{subsets Element::ownedElement} (opposite A_condition_extend::extend)
  // References the condition that must hold when the first ExtensionPoint is reached for the extension to take place. If no constraint is associated with the Extend relationship, the extension is unconditional.
}

function addEdge_extendedCase(_extend: GraphNode) {
  // TODO/Association
  // extendedCase : UseCase [1..1]{subsets DirectedRelationship::target} (opposite A_extendedCase_extend::extend)
  // The UseCase that is being extended.
}

function addEdge_extension(_extend: GraphNode) {
  // TODO/Association
  // extension : UseCase [1..1]{subsets NamedElement::namespace, subsets DirectedRelationship::source} (opposite UseCase::extend)
  // The UseCase that represents the extension and owns the Extend relationship.
}

function addEdge_extensionLocation(_extend: GraphNode) {
  // TODO/Association
  // extensionLocation : ExtensionPoint [1..*]{ordered} (opposite A_extensionLocation_extension::extension)
  // An ordered list of ExtensionPoints belonging to the extended UseCase, specifying where the respective behavioral fragments of the extending UseCase are to be inserted. The first fragment in the extending UseCase is associated with the first extension point in the list, the second fragment with the second point, and so on. Note that, in most practical cases, the extending UseCase has just a single behavior fragment, so that the list of ExtensionPoints is trivial.
}
