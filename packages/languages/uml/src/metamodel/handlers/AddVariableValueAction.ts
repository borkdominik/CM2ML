import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { AddVariableValueAction } from '../uml-metamodel'

export const AddVariableValueActionHandler =
  AddVariableValueAction.createHandler(
    (addVariableValueAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_insertAt(addVariableValueAction)
    },
    {
      [Uml.Attributes.isReplaceAll]: 'false',
    },
  )

function addEdge_insertAt(_addVariableValueAction: GraphNode) {
  // TODO/Association
  // ♦ insertAt : InputPin [0..1]{subsets Action::input} (opposite A_insertAt_addVariableValueAction::addVariableValueAction)
  // The InputPin that gives the position at which to insert a new value or move an existing value in ordered Variables. The type of the insertAt InputPin is UnlimitedNatural, but the value cannot be zero. It is omitted for unordered Variables.
}
