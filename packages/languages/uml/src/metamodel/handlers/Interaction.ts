import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { Interaction, Message } from '../uml-metamodel'

export const InteractionHandler = Interaction.createHandler(
  (interaction, { onlyContainmentAssociations }) => {
    const messages = resolveFromChild(interaction, 'message', { many: true, type: Message })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_action(interaction)
    addEdge_formalGate(interaction)
    addEdge_fragment(interaction)
    addEdge_lifeline(interaction)
    addEdge_message(interaction, messages)
  },
)

function addEdge_action(_interaction: GraphNode) {
  // TODO/Association
  // ♦ action : Action [0..*]{subsets Element::ownedElement} (opposite A_action_interaction::interaction)
  // Actions owned by the Interaction.
}

function addEdge_formalGate(_interaction: GraphNode) {
  // TODO/Association
  // ♦ formalGate : Gate [0..*]{subsets Namespace::ownedMember} (opposite A_formalGate_interaction::interaction)
  // Specifies the gates that form the message interface between this Interaction and any InteractionUses which reference it.
}

function addEdge_fragment(_interaction: GraphNode) {
  // TODO/Association
  // ♦ fragment : InteractionFragment [0..*]{ordered, subsets Namespace::ownedMember} (opposite InteractionFragment::enclosingInteraction)
  // The ordered set of fragments in the Interaction.
}

function addEdge_lifeline(_interaction: GraphNode) {
  // TODO/Association
  // ♦ lifeline : Lifeline [0..*]{subsets Namespace::ownedMember} (opposite Lifeline::interaction)
  // Specifies the participants in this Interaction.
}

function addEdge_message(interaction: GraphNode, messages: GraphNode[]) {
  // ♦ message : Message [0..*]{subsets Namespace::ownedMember} (opposite Message::interaction)
  // The Messages contained in this Interaction.
  messages.forEach((message) => {
    interaction.model.addEdge('message', interaction, message)
  })
}
