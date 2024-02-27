import type { GraphNode } from '@cm2ml/ir'

import { ReplyAction } from '../uml-metamodel'

export const ReplyActionHandler = ReplyAction.createHandler(
  (replyAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_replyToCall(replyAction)
    addEdge_replyValue(replyAction)
    addEdge_returnInformation(replyAction)
  },
)

function addEdge_replyToCall(_replyAction: GraphNode) {
  // TODO/Association
  // replyToCall : Trigger [1..1] (opposite A_replyToCall_replyAction::replyAction)
  // The Trigger specifying the Operation whose call is being replied to.
}

function addEdge_replyValue(_replyAction: GraphNode) {
  // TODO/Association
  // ♦ replyValue : InputPin [0..*]{ordered, subsets Action::input} (opposite A_replyValue_replyAction::replyAction)
  // A list of InputPins providing the values for the output (inout, out, and return) Parameters of the Operation. These values are returned to the caller.
}

function addEdge_returnInformation(_replyAction: GraphNode) {
  // TODO/Association
  // ♦ returnInformation : InputPin [1..1]{subsets Action::input} (opposite A_returnInformation_replyAction::replyAction)
  // An InputPin that holds the return information value produced by an earlier AcceptCallAction.
}
