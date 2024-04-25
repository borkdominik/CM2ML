import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { RemoveVariableValueAction } from '../uml-metamodel'

export const RemoveVariableValueActionHandler =
  RemoveVariableValueAction.createHandler(
    (removeVariableValueAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_removeAt(removeVariableValueAction)
    },
    {
      [Uml.Attributes.isRemoveDuplicates]: { type: 'boolean', defaultValue: 'false' },
    },
  )

function addEdge_removeAt(_removeVariableValueAction: GraphNode) {
  // TODO/Association
  // ♦ removeAt : InputPin [0..1]{subsets Action::input} (opposite A_removeAt_removeVariableValueAction::removeVariableValueAction )
  // An InputPin that provides the position of an existing value to remove in ordered, nonunique Variables. The type of the removeAt InputPin is UnlimitedNatural, but the value cannot be zero or unlimited.
}
