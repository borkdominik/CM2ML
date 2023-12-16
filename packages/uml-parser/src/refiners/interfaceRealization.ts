import { Uml } from '../uml'

import { Realization } from './realization'

// TODO
export const InterfaceRealization = Realization.extend(
  (node) => node.tag === Uml.Tags.interfaceRealization,
  (node) => {
    // Contract
    const contract = node.getAttribute('contract')?.value.literal
    if (contract === undefined) {
      throw new Error('InterfaceRealization must have a contract')
    }
    const resolvedContract = node.model.getNodeById(contract)
    if (!resolvedContract) {
      throw new Error('InterfaceRealization must have a resolved contract')
    }
    node.model.addEdge('contract', node, resolvedContract)

    // ImplementingClassifier
    const implementingClassifierId = node.getAttribute('client')?.value.literal
    if (implementingClassifierId === undefined) {
      throw new Error('InterfaceRealization must have a client')
    }
    const resolvedImplementingClassifier = node.model.getNodeById(
      implementingClassifierId,
    )
    if (!resolvedImplementingClassifier) {
      throw new Error('InterfaceRealization must have a resolved client')
    }
    node.model.addEdge(
      'interfaceRealization',
      resolvedImplementingClassifier,
      node,
    )
    node.model.addEdge(
      'implementingClassifier',
      node,
      resolvedImplementingClassifier,
    )

    node.tag = Uml.Types.InterfaceRealization
  },
)
