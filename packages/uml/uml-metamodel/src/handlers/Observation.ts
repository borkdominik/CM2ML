import { Observation } from '../uml-metamodel'

export const ObservationHandler = Observation.createHandler(
  (_observation, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      //   return
    }
  },
)
