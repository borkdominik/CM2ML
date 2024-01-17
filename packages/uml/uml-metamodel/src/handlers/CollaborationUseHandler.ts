import type { GraphNode } from '@cm2ml/ir'

import { CollaborationUse } from '../uml-metamodel'

export const CollaborationUseHandler = CollaborationUse.createHandler(
  (collaborationUse, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_collaborationUseRoleBinding(collaborationUse)
    addEdge_type(collaborationUse)
  },
)

function addEdge_collaborationUseRoleBinding(_collaborationUse: GraphNode) {
  // TODO
  // ♦ roleBinding: Dependency[0..*]{subsets Element:: ownedElement } (opposite A_roleBinding_collaborationUse::collaborationUse)
  // A mapping between features of the Collaboration and features of the owning Classifier.This mapping indicates which ConnectableElement of the Classifier plays which role(s) in the Collaboration.A ConnectableElement may be bound to multiple roles in the same CollaborationUse(that is, it may play multiple roles).
}

function addEdge_type(_collaborationUse: GraphNode) {
  // TODO
  // type: Collaboration[1..1](opposite A_type_collaborationUse::collaborationUse)
  // The Collaboration which is used in this CollaborationUse.The Collaboration defines the cooperation between its roles which are mapped to ConnectableElements relating to the Classifier owning the CollaborationUse.
}
