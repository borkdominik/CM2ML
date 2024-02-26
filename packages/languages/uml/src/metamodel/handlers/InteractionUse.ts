import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Gate, Interaction, InteractionUse } from '../uml-metamodel'

export const InteractionUseHandler = InteractionUse.createHandler(
  (interactionUse, { onlyContainmentAssociations }) => {
    const actualGates = resolve(interactionUse, 'actualGate', { many: true, type: Gate })
    const refersTo = resolve(interactionUse, 'refersTo', { type: Interaction })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_actualGate(interactionUse, actualGates)
    addEdge_argument(interactionUse)
    addEdge_refersTo(interactionUse, refersTo)
    addEdge_returnValue(interactionUse)
    addEdge_returnValueRecipient(interactionUse)
  },
)
function addEdge_actualGate(interactionUse: GraphNode, actualGates: GraphNode[]) {
  // ♦ actualGate : Gate [0..*]{subsets Element::ownedElement} (opposite A_actualGate_interactionUse::interactionUse)
  // The actual gates of the InteractionUse.
  actualGates.forEach((actualGate) => {
    interactionUse.model.addEdge('actualGate', interactionUse, actualGate)
  })
}

function addEdge_argument(_interactionUse: GraphNode) {
  // TODO/Association
  // ♦ argument : ValueSpecification [0..*]{ordered, subsets Element::ownedElement} (opposite A_argument_interactionUse::interactionUse)
  // The actual arguments of the Interaction.
}

function addEdge_refersTo(interactionUse: GraphNode, refersTo: GraphNode | undefined) {
  // refersTo : Interaction [1..1] (opposite A_refersTo_interactionUse::interactionUse)
  // Refers to the Interaction that defines its meaning.
  if (!refersTo) {
    return
  }
  interactionUse.model.addEdge('refersTo', interactionUse, refersTo)
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
