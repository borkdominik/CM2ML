import { Event } from '../uml-metamodel'

export const EventHandler = Event.createHandler(
  (_event, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      // return
    }
  },
)
