import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Behavior, ObjectFlow } from '../uml-metamodel'

export const ObjectFlowHandler = ObjectFlow.createHandler(
  (objectFlow, { onlyContainmentAssociations }) => {
    const selection = resolve(objectFlow, 'selection', { type: Behavior })
    const transformation = resolve(objectFlow, 'transformation', { type: Behavior })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_selection(objectFlow, selection)
    addEdge_transformation(objectFlow, transformation)
  },
  {
    [Uml.Attributes.isMulticast]: 'false',
    [Uml.Attributes.isMultireceive]: 'false',
  },
)

function addEdge_selection(objectFlow: GraphNode, selection: GraphNode | undefined) {
  // selection : Behavior [0..1] (opposite A_selection_objectFlow::objectFlow)
  // A Behavior used to select tokens from a source ObjectNode.
  if (!selection) {
    return
  }
  objectFlow.model.addEdge('selection', objectFlow, selection)
}

function addEdge_transformation(objectFlow: GraphNode, transformation: GraphNode | undefined) {
  // transformation : Behavior [0..1] (opposite A_transformation_objectFlow::objectFlow)
  // A Behavior used to change or replace object tokens flowing along the ObjectFlow.
  if (!transformation) {
    return
  }
  objectFlow.model.addEdge('transformation', objectFlow, transformation)
}
