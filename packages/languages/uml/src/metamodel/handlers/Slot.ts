import type { GraphNode } from '@cm2ml/ir'

import { Slot } from '../uml-metamodel'

export const SlotHandler = Slot.createHandler(
  (slot, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_definingFeature(slot)
    addEdge_owningInstance(slot)
    addEdge_value(slot)
  },
)

function addEdge_definingFeature(_slot: GraphNode) {
  // TODO/Association
  // definingFeature : StructuralFeature [1..1] (opposite A_definingFeature_slot::slot)
  // The StructuralFeature that specifies the values that may be held by the Slot.
}

function addEdge_owningInstance(_slot: GraphNode) {
  // TODO/Association
  // owningInstance : InstanceSpecification [1..1]{subsets Element::owner} (opposite InstanceSpecification::slot)
  // The InstanceSpecification that owns this Slot.
}

function addEdge_value(_slot: GraphNode) {
  // TODO/Association
  // ♦ value : ValueSpecification [0..*]{ordered, subsets Element::ownedElement} (opposite A_value_owningSlot::owningSlot)
  // The value or values held by the Slot.
}
