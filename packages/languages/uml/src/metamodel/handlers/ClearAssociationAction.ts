import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Association, ClearAssociationAction } from '../uml-metamodel'

export const ClearAssociationActionHandler =
  ClearAssociationAction.createHandler(
    (clearAssociationAction, { onlyContainmentAssociations }) => {
      const association = resolve(clearAssociationAction, 'association', { type: Association })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_association(clearAssociationAction, association)
      addEdge_object(clearAssociationAction)
    },
  )

function addEdge_association(clearAssociationAction: GraphNode, association: GraphNode | undefined) {
  // association : Association [1..1] (opposite A_association_clearAssociationAction::clearAssociationAction)
  // The Association to be cleared.
  if (!association) {
    return
  }
  clearAssociationAction.model.addEdge('association', clearAssociationAction, association)
}

function addEdge_object(_clearAssociationAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_clearAssociationAction::clearAssociationAction)
  // The InputPin that gives the object whose participation in the Association is to be cleared.
}
