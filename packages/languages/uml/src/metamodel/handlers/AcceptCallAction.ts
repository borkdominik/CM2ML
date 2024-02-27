import type { GraphNode } from '@cm2ml/ir'

import { AcceptCallAction } from '../uml-metamodel'

export const AcceptCallActionHandler = AcceptCallAction.createHandler(
  (acceptCallAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_returnInformation(acceptCallAction)
  },
)

function addEdge_returnInformation(_acceptCallAction: GraphNode) {
  // TODO/Association
  // ♦ returnInformation : OutputPin [1..1]{subsets Action::output} (opposite A_returnInformation_acceptCallAction::acceptCallAction)
  // An OutputPin where a value is placed containing sufficient information to perform a subsequent ReplyAction and return control to the caller. The contents of this value are opaque. It can be passed and copied but it cannot be manipulated by the model.
}
