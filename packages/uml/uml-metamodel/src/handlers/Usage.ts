import { Usage } from '../uml-metamodel'

// Note: No additional associations over generalization
export const UsageHandler = Usage.createHandler(
  (_usage, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      //   return
    }
  },
)
