import { setBodyAttribute } from '../resolvers/body'
import { setLanguageAttribute } from '../resolvers/language'
import { Uml } from '../uml'
import { OpaqueBehavior } from '../uml-metamodel'

// TODO/Jan: Verify that `body` attribute is instantiated correctly
export const OpaqueBehaviorHandler = OpaqueBehavior.createHandler((opaqueBehavior, { onlyContainmentAssociations }) => {
  setBodyAttribute(opaqueBehavior)
  setLanguageAttribute(opaqueBehavior)
  if (onlyContainmentAssociations) {
    // return
  }
}, {
  [Uml.Attributes.body]: { type: 'string' },
  [Uml.Attributes.language]: { type: 'string' },
})
