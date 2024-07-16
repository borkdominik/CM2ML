import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { InstanceSpecification, Slot, StructuralFeature } from '../uml-metamodel'

export const SlotHandler = Slot.createHandler(
  (slot, { onlyContainmentAssociations }) => {
    const definingFeature = resolve(slot, 'definingFeature', { type: StructuralFeature })
    const owningInstance = resolve(slot, 'owningInstance', { type: InstanceSpecification })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_definingFeature(slot, definingFeature)
    addEdge_owningInstance(slot, owningInstance)
    addEdge_value(slot)
  },
)

function addEdge_definingFeature(slot: GraphNode, definingFeature: GraphNode | undefined) {
  // definingFeature : StructuralFeature [1..1] (opposite A_definingFeature_slot::slot)
  // The StructuralFeature that specifies the values that may be held by the Slot.
  if (!definingFeature) {
    return
  }
  slot.model.addEdge('definingFeature', slot, definingFeature)
}

function addEdge_owningInstance(slot: GraphNode, owningInstance: GraphNode | undefined) {
  // owningInstance : InstanceSpecification [1..1]{subsets Element::owner} (opposite InstanceSpecification::slot)
  // The InstanceSpecification that owns this Slot.
  if (!owningInstance) {
    return
  }
  slot.model.addEdge('owningInstance', slot, owningInstance)
}

function addEdge_value(_slot: GraphNode) {
  // TODO/Association
  // ♦ value : ValueSpecification [0..*]{ordered, subsets Element::ownedElement} (opposite A_value_owningSlot::owningSlot)
  // The value or values held by the Slot.
}
