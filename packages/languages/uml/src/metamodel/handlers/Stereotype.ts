import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Image, Stereotype } from '../uml-metamodel'

export const StereotypeHandler = Stereotype.createHandler(
  (stereotype, { onlyContainmentAssociations }) => {
    const icons = resolve(stereotype, 'icon', { many: true, type: Image })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_icon(stereotype, icons)
    addEdge_profile(stereotype)
  },
)

function addEdge_icon(stereotype: GraphNode, icons: GraphNode[]) {
  // ♦ icon : Image [0..*]{subsets Element::ownedElement} (opposite A_icon_stereotype::stereotype)
  // Stereotype can change the graphical appearance of the extended model element by using attached icons. When this association is not null, it references the location of the icon content to be displayed within diagrams presenting the extended model elements.
  icons.forEach((icon) => {
    stereotype.model.addEdge('icon', stereotype, icon)
  })
}

function addEdge_profile(_stereotype: GraphNode) {
  // TODO/Association
  // /profile : Profile [1..1]{} (opposite A_profile_stereotype::stereotype)
  // The profile that directly or indirectly contains this stereotype.
}
