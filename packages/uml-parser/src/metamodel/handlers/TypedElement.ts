import { Uml } from '../../uml'
import { TypedElement } from '../metamodel'

// TODO
export const TypedElementHandler = TypedElement.createHandler((node) => {
  const type = node.getAttribute('type')?.value.literal
  if (type === undefined) {
    return
  }
  if (Uml.isValidType(type)) {
    return
  }
  const resolvedType = node.model.getNodeById(type)
  if (!resolvedType) {
    return
  }
  node.model.addEdge('type', node, resolvedType)
})
