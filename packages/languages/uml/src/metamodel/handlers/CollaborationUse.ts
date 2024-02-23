import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { CollaborationUse, Dependency } from '../uml-metamodel'

export const CollaborationUseHandler = CollaborationUse.createHandler(
  (collaborationUse, { onlyContainmentAssociations }) => {
    const collaborationUseRoleBindings = resolve(collaborationUse, 'roleBinding', { many: true, type: Dependency })
    const type = resolve(collaborationUse, 'type')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_collaborationUseRoleBinding(collaborationUse, collaborationUseRoleBindings)
    addEdge_type(collaborationUse, type)
  },
)

function addEdge_collaborationUseRoleBinding(collaborationUse: GraphNode, collaborationUseRoleBindings: GraphNode[]) {
  // ♦ roleBinding: Dependency[0..*]{subsets Element:: ownedElement } (opposite A_roleBinding_collaborationUse::collaborationUse)
  // A mapping between features of the Collaboration and features of the owning Classifier.This mapping indicates which ConnectableElement of the Classifier plays which role(s) in the Collaboration.A ConnectableElement may be bound to multiple roles in the same CollaborationUse(that is, it may play multiple roles).
  collaborationUseRoleBindings.forEach((collaborationUseRoleBinding) => {
    collaborationUse.model.addEdge('roleBinding', collaborationUse, collaborationUseRoleBinding)
  })
}

function addEdge_type(collaborationUse: GraphNode, type: GraphNode | undefined) {
  // type: Collaboration[1..1](opposite A_type_collaborationUse::collaborationUse)
  // The Collaboration which is used in this CollaborationUse.The Collaboration defines the cooperation between its roles which are mapped to ConnectableElements relating to the Classifier owning the CollaborationUse.
  if (!type) {
    return
  }
  collaborationUse.model.addEdge('type', collaborationUse, type)
}
