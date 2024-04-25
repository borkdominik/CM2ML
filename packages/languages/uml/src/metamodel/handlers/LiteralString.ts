import { Uml } from '../uml'
import { LiteralString } from '../uml-metamodel'

export const LiteralStringHandler = LiteralString.createHandler((_literalString, { onlyContainmentAssociations }) => {
  if (onlyContainmentAssociations) {
    // return
  }
}, {
  [Uml.Attributes.value]: { type: 'string' },
})
