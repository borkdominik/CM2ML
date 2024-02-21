import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Interaction } from '../uml-metamodel'

export const InteractionHandler = Interaction.createHandler(
  (interaction, { onlyContainmentAssociations }) => {
    inferChildTypes(interaction)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_action(interaction)
    addEdge_formalGate(interaction)
    addEdge_fragment(interaction)
    addEdge_lifeline(interaction)
    addEdge_message(interaction)
  },
)

function inferChildTypes(interaction: GraphNode) {
  interaction.children.forEach((child) => {
    if (child.tag === Uml.Tags.message) {
      child.addAttribute({ name: Uml.typeAttributeName, value: { literal: Uml.Types.Message } })
    }
  })
}

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

function addEdge_message(_interaction: GraphNode) {
  // TODO/Association
  // ♦ message : Message [0..*]{subsets Namespace::ownedMember} (opposite Message::interaction)
  // The Messages contained in this Interaction.
}
