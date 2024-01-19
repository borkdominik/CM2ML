import type { GraphNode } from '@cm2ml/ir'

import { Stereotype } from '../uml-metamodel'

export const StereotypeHandler = Stereotype.createHandler(
  (stereotype, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_icon(stereotype)
    addEdge_profile(stereotype)
  },
)

function addEdge_icon(_stereotype: GraphNode) {
  // TODO/Association
  // ♦ icon : Image [0..*]{subsets Element::ownedElement} (opposite A_icon_stereotype::stereotype)
  // Stereotype can change the graphical appearance of the extended model element by using attached icons. When this association is not null, it references the location of the icon content to be displayed within diagrams presenting the extended model elements.
}

function addEdge_profile(_stereotype: GraphNode) {
  // TODO/Association
  // /profile : Profile [1..1]{} (opposite A_profile_stereotype::stereotype)
  // The profile that directly or indirectly contains this stereotype.
}
