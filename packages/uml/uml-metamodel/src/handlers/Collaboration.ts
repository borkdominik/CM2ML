import type { GraphNode } from '@cm2ml/ir'

import { Collaboration } from '../uml-metamodel'

export const CollaborationHandler = Collaboration.createHandler(
  (collaboration, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_collaborationRole(collaboration)
  },
)

function addEdge_collaborationRole(_collaboration: GraphNode) {
  // TODO/Association
  //   collaborationRole: ConnectableElement[0..*]{subsets StructuredClassifier:: role } (opposite A_collaborationRole_collaboration::collaboration)
  //   Represents the participants in the Collaboration.
}
