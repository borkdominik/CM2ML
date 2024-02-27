import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { AddVariableValueAction, InputPin } from '../uml-metamodel'

export const AddVariableValueActionHandler =
  AddVariableValueAction.createHandler(
    (addVariableValueAction, { onlyContainmentAssociations }) => {
      const insertAt = resolve(addVariableValueAction, 'insertAt', { type: InputPin })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_insertAt(addVariableValueAction, insertAt)
    },
    {
      [Uml.Attributes.isReplaceAll]: 'false',
    },
  )

function addEdge_insertAt(addVariableValueAction: GraphNode, insertAt: GraphNode | undefined) {
  // ♦ insertAt : InputPin [0..1]{subsets Action::input} (opposite A_insertAt_addVariableValueAction::addVariableValueAction)
  // The InputPin that gives the position at which to insert a new value or move an existing value in ordered Variables. The type of the insertAt InputPin is UnlimitedNatural, but the value cannot be zero. It is omitted for unordered Variables.
  if (!insertAt) {
    return
  }
  addVariableValueAction.model.addEdge('insertAt', addVariableValueAction, insertAt)
}
