import { LiteralString } from '../uml-metamodel'

export const LiteralStringHandler = LiteralString.createHandler((_literalString, { onlyContainmentAssociations }) => {
  if (onlyContainmentAssociations) {
    // return
  }
})
