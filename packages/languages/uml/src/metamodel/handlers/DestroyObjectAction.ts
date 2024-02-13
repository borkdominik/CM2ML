import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { DestroyObjectAction } from '../uml-metamodel'

export const DestroyObjectActionHandler = DestroyObjectAction.createHandler(
  (destroyObjectAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_target(destroyObjectAction)
  },
  {
    [Uml.Attributes.isDestroyLinks]: 'false',
    [Uml.Attributes.isDestroyOwnedObjects]: 'false',
  },
)

function addEdge_target(_destroyObjectAction: GraphNode) {
  // TODO/Association
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_destroyObjectAction::destroyObjectAction)
  // The InputPin providing the object to be destroyed.
}
