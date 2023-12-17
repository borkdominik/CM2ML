import { Uml, setFallbackType } from '../../uml'
import { Operation, Parameter } from '../metamodel'

// TODO
export const OperationHandler = Operation.createHandler((node) => {
  const parent = node.parent
  if (!parent) {
    throw new Error('OwnedOperation must have a parent')
  }
  node.model.addEdge('ownedOperation', parent, node)
  node.children.forEach((child) => {
    if (Parameter.isAssignable(child)) {
      node.model.addEdge('ownedParameter', node, child)
    }
  })

  setFallbackType(node, Uml.Types.Operation)
})
