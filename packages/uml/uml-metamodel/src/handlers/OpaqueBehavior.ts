import { setBodyAttribute } from '../resolvers/body'
import { setLanguageAttribute } from '../resolvers/language'
import { OpaqueBehavior } from '../uml-metamodel'

// TODO: Verify that `body` attribute is instantiated correctly
export const OpaqueBehaviorHandler = OpaqueBehavior.createHandler((opaqueBehavior, { onlyContainmentAssociations }) => {
  setBodyAttribute(opaqueBehavior)
  setLanguageAttribute(opaqueBehavior)
  if (onlyContainmentAssociations) {
    // return
  }
})
