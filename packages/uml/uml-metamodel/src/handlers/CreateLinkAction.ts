import type { GraphNode } from '@cm2ml/ir'

import { CreateLinkAction } from '../uml-metamodel'

export const CreateLinkActionHandler = CreateLinkAction.createHandler(
  (createLinkAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endData(createLinkAction)
  },
)

function addEdge_endData(_createLinkAction: GraphNode) {
  // TODO/Association
  // ♦ endData : LinkEndCreationData [2..*]{redefines LinkAction::endData} (opposite A_endData_createLinkAction::createLinkAction)
  // The LinkEndData that specifies the values to be placed on the Association ends for the new link.
}
