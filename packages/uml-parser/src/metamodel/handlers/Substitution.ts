import { Uml, setFallbackType } from '../../uml'
import { Substitution } from '../metamodel'

// TODO: Edge from/to classifier
export const SubstitutionHandler = Substitution.createHandler((node) => {
  setFallbackType(node, Uml.Types.Substitution)
})
