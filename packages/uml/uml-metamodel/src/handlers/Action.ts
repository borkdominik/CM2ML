import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { Action } from '../uml-metamodel'

export const ActionHandler = Action.createHandler(
  (action, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_context(action)
    addEdge_input(action)
    addEdge_localPostcondition(action)
    addEdge_localPrecondition(action)
    addEdge_output(action)
  },
  {
    [Uml.Attributes.isLocallyReentrant]: 'false',
  },
)

function addEdge_context(_action: GraphNode) {
  // TODO
  // /context : Classifier [0..1]{} (opposite A_context_action::action)
  // The context Classifier of the Behavior that contains this Action, or the Behavior itself if it has no context.
}

function addEdge_input(_action: GraphNode) {
  // TODO
  // ♦ /input : InputPin [0..*]{ordered, union, subsets Element::ownedElement} (opposite A_input_action::action)
  // The ordered set of InputPins representing the inputs to the Action.
}

function addEdge_localPostcondition(_action: GraphNode) {
  // TODO
  // ♦ localPostcondition : Constraint [0..*]{subsets Element::ownedElement} (opposite A_localPostcondition_action::action)
  // A Constraint that must be satisfied when execution of the Action is completed.
}

function addEdge_localPrecondition(_action: GraphNode) {
  // TODO
  // ♦ localPrecondition : Constraint [0..*]{subsets Element::ownedElement} (opposite A_localPrecondition_action::action)
  // A Constraint that must be satisfied when execution of the Action is started.
}

function addEdge_output(_action: GraphNode) {
  // TODO
  // ♦ /output : OutputPin [0..*]{ordered, union, subsets Element::ownedElement} (opposite A_output_action::action)
  // The ordered set of OutputPins representing outputs from the Action.
}
