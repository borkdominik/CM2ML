import { Uml, setFallbackType } from '../../uml'
import { Property } from '../metamodel'

// TODO
export const PropertyHandler = Property.createHandler((node) => {
  setFallbackType(node, Uml.Types.Property)
})
