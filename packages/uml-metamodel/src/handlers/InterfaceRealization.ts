import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { InterfaceRealization } from '../uml-metamodel'

export const InterfaceRealizationHandler = InterfaceRealization.createHandler(
  (
    interfaceRealization,
    { onlyContainmentAssociations, relationshipsAsEdges },
  ) => {
    if (relationshipsAsEdges) {
      return { nodeAsEdgeTag: 'interfaceRealization' }
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_contract(interfaceRealization)
    addEdge_implementingClassifier(interfaceRealization)
  },
)

function addEdge_contract(interfaceRealization: GraphNode) {
  const contractId = interfaceRealization.getAttribute(Uml.Attributes.contract)
    ?.value.literal
  if (contractId === undefined) {
    throw new Error('InterfaceRealization must have a contract')
  }
  const contract = interfaceRealization.model.getNodeById(contractId)
  if (!contract) {
    throw new Error('InterfaceRealization must have a resolved contract')
  }
  interfaceRealization.model.addEdge('contract', interfaceRealization, contract)
}

function addEdge_implementingClassifier(interfaceRealization: GraphNode) {
  const implementingClassifierId = interfaceRealization.getAttribute(
    Uml.Attributes.client,
  )?.value.literal
  if (implementingClassifierId === undefined) {
    throw new Error('InterfaceRealization must have a client')
  }
  const implementingClassifier = interfaceRealization.model.getNodeById(
    implementingClassifierId,
  )
  if (!implementingClassifier) {
    throw new Error('InterfaceRealization must have a resolved client')
  }
  interfaceRealization.model.addEdge(
    'implementingClassifier',
    interfaceRealization,
    implementingClassifier,
  )
}
