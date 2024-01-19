import type { GraphNode } from '@cm2ml/ir'

import { DestroyLinkAction } from '../uml-metamodel'

export const DestroyLinkActionHandler = DestroyLinkAction.createHandler(
  (destroyLinkAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_endData(destroyLinkAction)
  },
)

function addEdge_endData(_destroyLinkAction: GraphNode) {
  // TODO/Association
  // ♦ endData : LinkEndDestructionData [2..*]{redefines LinkAction::endData} (opposite A_endData_destroyLinkAction::destroyLinkAction)
  // The LinkEndData that the values of the Association ends for the links to be destroyed.
}
