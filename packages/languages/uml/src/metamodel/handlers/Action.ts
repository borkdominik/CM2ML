import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute, resolveFromChild } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Action, Constraint } from '../uml-metamodel'

export const ActionHandler = Action.createHandler(
  (action, { onlyContainmentAssociations }) => {
    const input = resolveFromAttribute(action, 'input', { many: true })
    const localPostconditions = resolveFromChild(action, 'localPostcondition', { many: true, type: Constraint })
    const localPreconditions = resolveFromChild(action, 'localPrecondition', { many: true, type: Constraint })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_context(action)
    addEdge_input(action, input)
    addEdge_localPostcondition(action, localPostconditions)
    addEdge_localPrecondition(action, localPreconditions)
    addEdge_output(action)
  },
  {
    [Uml.Attributes.isLocallyReentrant]: 'false',
  },
)

function addEdge_context(_action: GraphNode) {
  // TODO/Association
  // /context : Classifier [0..1]{} (opposite A_context_action::action)
  // The context Classifier of the Behavior that contains this Action, or the Behavior itself if it has no context.
}

function addEdge_input(action: GraphNode, input: GraphNode[]) {
  // ♦ /input : InputPin [0..*]{ordered, union, subsets Element::ownedElement} (opposite A_input_action::action)
  // The ordered set of InputPins representing the inputs to the Action.
  input.forEach((input) => {
    action.model.addEdge('input', action, input)
  })
}

function addEdge_localPostcondition(action: GraphNode, localPostconditions: GraphNode[]) {
  // ♦ localPostcondition : Constraint [0..*]{subsets Element::ownedElement} (opposite A_localPostcondition_action::action)
  // A Constraint that must be satisfied when execution of the Action is completed.
  localPostconditions.forEach((localPostcondition) => {
    action.model.addEdge('localPostcondition', action, localPostcondition)
  })
}

function addEdge_localPrecondition(action: GraphNode, localPreconditions: GraphNode[]) {
  // ♦ localPrecondition : Constraint [0..*]{subsets Element::ownedElement} (opposite A_localPrecondition_action::action)
  // A Constraint that must be satisfied when execution of the Action is started.
  localPreconditions.forEach((localPrecondition) => {
    action.model.addEdge('localPrecondition', action, localPrecondition)
  })
}

function addEdge_output(_action: GraphNode) {
  // TODO/Association
  // ♦ /output : OutputPin [0..*]{ordered, union, subsets Element::ownedElement} (opposite A_output_action::action)
  // The ordered set of OutputPins representing outputs from the Action.
}
