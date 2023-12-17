import { Uml, setFallbackType } from '../../uml'
import { Parameter } from '../metamodel'

// TODO
export const ParameterHandler = Parameter.createHandler((node) => {
  const parent = node.parent
  if (parent) {
    node.model.addEdge('operation', node, parent)
  }

  setFallbackType(node, Uml.Types.Parameter)
})
