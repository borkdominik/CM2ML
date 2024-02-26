import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Collaboration, ConnectableElement } from '../uml-metamodel'

export const CollaborationHandler = Collaboration.createHandler(
  (collaboration, { onlyContainmentAssociations }) => {
    const collaborationRoles = resolveFromAttribute(collaboration, 'collaborationRole', { many: true, type: ConnectableElement })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_collaborationRole(collaboration, collaborationRoles)
  },
)

function addEdge_collaborationRole(collaboration: GraphNode, collaborationRoles: GraphNode[]) {
  // collaborationRole: ConnectableElement[0..*]{subsets StructuredClassifier:: role } (opposite A_collaborationRole_collaboration::collaboration)
  // Represents the participants in the Collaboration.
  collaborationRoles.forEach((collaborationRole) => {
    collaboration.model.addEdge('collaborationRole', collaboration, collaborationRole)
  })
}
