import type { GraphNode } from '@cm2ml/ir'

import { InteractionUse } from '../uml-metamodel'

export const InteractionUseHandler = InteractionUse.createHandler(
  (interactionUse, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_actualGate(interactionUse)
    addEdge_argument(interactionUse)
    addEdge_refersTo(interactionUse)
    addEdge_returnValue(interactionUse)
    addEdge_returnValueRecipient(interactionUse)
  },
)
function addEdge_actualGate(_interactionUse: GraphNode) {
  // TODO/Association
  // ♦ actualGate : Gate [0..*]{subsets Element::ownedElement} (opposite A_actualGate_interactionUse::interactionUse)
  // The actual gates of the InteractionUse.
}

function addEdge_argument(_interactionUse: GraphNode) {
  // TODO/Association
  // ♦ argument : ValueSpecification [0..*]{ordered, subsets Element::ownedElement} (opposite A_argument_interactionUse::interactionUse)
  // The actual arguments of the Interaction.
}

function addEdge_refersTo(_interactionUse: GraphNode) {
  // TODO/Association
  // refersTo : Interaction [1..1] (opposite A_refersTo_interactionUse::interactionUse)
  // Refers to the Interaction that defines its meaning.
}

function addEdge_returnValue(_interactionUse: GraphNode) {
  // TODO/Association
  // ♦ returnValue : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_returnValue_interactionUse::interactionUse)
  // The value of the executed Interaction.
}

function addEdge_returnValueRecipient(_interactionUse: GraphNode) {
  // TODO/Association
  // returnValueRecipient : Property [0..1] (opposite A_returnValueRecipient_interactionUse::interactionUse)
  // The recipient of the return value.
}
