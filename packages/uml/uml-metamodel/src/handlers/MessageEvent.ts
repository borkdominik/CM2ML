import { MessageEvent } from '../uml-metamodel'

export const MessageEventHandler = MessageEvent.createHandler(
  (_messageEvent, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
)
