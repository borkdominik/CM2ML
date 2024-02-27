import type { GraphNode } from '@cm2ml/ir'

import { CreateLinkObjectAction } from '../uml-metamodel'

export const CreateLinkObjectActionHandler =
  CreateLinkObjectAction.createHandler(
    (createLinkObjectAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_result(createLinkObjectAction)
    },
  )

function addEdge_result(_createLinkObjectAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_createLinkObjectAction::createLinkObjectAction)
  // The output pin on which the newly created link object is placed.
}
