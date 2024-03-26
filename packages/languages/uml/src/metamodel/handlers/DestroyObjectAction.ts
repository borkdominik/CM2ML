import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { DestroyObjectAction, InputPin } from '../uml-metamodel'

export const DestroyObjectActionHandler = DestroyObjectAction.createHandler(
  (destroyObjectAction, { onlyContainmentAssociations }) => {
    const target = resolve(destroyObjectAction, 'target', { type: InputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_target(destroyObjectAction, target)
  },
  {
    [Uml.Attributes.isDestroyLinks]: 'false',
    [Uml.Attributes.isDestroyOwnedObjects]: 'false',
  },
)

function addEdge_target(destroyObjectAction: GraphNode, target: GraphNode | undefined) {
  // ♦ target : InputPin [1..1]{subsets Action::input} (opposite A_target_destroyObjectAction::destroyObjectAction)
  // The InputPin providing the object to be destroyed.
  if (!target) {
    return
  }
  destroyObjectAction.model.addEdge('target', destroyObjectAction, target)
}
