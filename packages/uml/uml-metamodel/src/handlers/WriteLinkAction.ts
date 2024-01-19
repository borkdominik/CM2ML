import { WriteLinkAction } from '../uml-metamodel'

export const WriteLinkActionHandler = WriteLinkAction.createHandler(
  (_writeLinkAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
)
