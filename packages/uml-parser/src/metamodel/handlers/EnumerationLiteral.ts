import { Uml, setFallbackType } from '../../uml'
import { EnumerationLiteral } from '../metamodel'

// TODO
export const EnumerationLiteralHandler = EnumerationLiteral.createHandler(
  (node) => {
    setFallbackType(node, Uml.Types.EnumerationLiteral)
  },
)
