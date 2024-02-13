import type { GraphNode } from '@cm2ml/ir'

import { ClearAssociationAction } from '../uml-metamodel'

export const ClearAssociationActionHandler =
  ClearAssociationAction.createHandler(
    (clearAssociationAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_association(clearAssociationAction)
      addEdge_object(clearAssociationAction)
    },
  )

function addEdge_association(_clearAssociationAction: GraphNode) {
  // TODO/Association
  // association : Association [1..1] (opposite A_association_clearAssociationAction::clearAssociationAction)
  // The Association to be cleared.
}

function addEdge_object(_clearAssociationAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_clearAssociationAction::clearAssociationAction)
  // The InputPin that gives the object whose participation in the Association is to be cleared.
}
