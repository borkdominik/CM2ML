import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Gate, Interaction, Lifeline, Message } from '../uml-metamodel'

export const InteractionHandler = Interaction.createHandler(
  (interaction, { onlyContainmentAssociations }) => {
    const formalGates = resolve(interaction, 'formalGate', { many: true, type: Gate })
    const lifelines = resolve(interaction, 'lifeline', { many: true, type: Lifeline })
    const messages = resolve(interaction, 'message', { many: true, type: Message })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_action(interaction)
    addEdge_formalGate(interaction, formalGates)
    addEdge_fragment(interaction)
    addEdge_lifeline(interaction, lifelines)
    addEdge_message(interaction, messages)
  },
)

function addEdge_action(_interaction: GraphNode) {
  // TODO/Association
  // ♦ action : Action [0..*]{subsets Element::ownedElement} (opposite A_action_interaction::interaction)
  // Actions owned by the Interaction.
}

function addEdge_formalGate(interaction: GraphNode, formalGates: GraphNode[]) {
  // ♦ formalGate : Gate [0..*]{subsets Namespace::ownedMember} (opposite A_formalGate_interaction::interaction)
  // Specifies the gates that form the message interface between this Interaction and any InteractionUses which reference it.\
  formalGates.forEach((formalGate) => {
    interaction.model.addEdge('formalGate', interaction, formalGate)
  })
}

function addEdge_fragment(_interaction: GraphNode) {
  // TODO/Association
  // ♦ fragment : InteractionFragment [0..*]{ordered, subsets Namespace::ownedMember} (opposite InteractionFragment::enclosingInteraction)
  // The ordered set of fragments in the Interaction.
}

function addEdge_lifeline(interaction: GraphNode, lifelines: GraphNode[]) {
  // ♦ lifeline : Lifeline [0..*]{subsets Namespace::ownedMember} (opposite Lifeline::interaction)
  // Specifies the participants in this Interaction.
  lifelines.forEach((lifeline) => {
    interaction.model.addEdge('lifeline', interaction, lifeline)
  })
}

function addEdge_message(interaction: GraphNode, messages: GraphNode[]) {
  // ♦ message : Message [0..*]{subsets Namespace::ownedMember} (opposite Message::interaction)
  // The Messages contained in this Interaction.
  messages.forEach((message) => {
    interaction.model.addEdge('message', interaction, message)
  })
}
