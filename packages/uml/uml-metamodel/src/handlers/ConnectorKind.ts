import { ConnectorKind } from '../uml-metamodel'

export const ConnectorKindHandler = ConnectorKind.createHandler(
  (_connectorKind, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
)
