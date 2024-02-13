import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ObjectFlow } from '../uml-metamodel'

export const ObjectFlowHandler = ObjectFlow.createHandler(
  (objectFlow, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_selection(objectFlow)
    addEdge_transformation(objectFlow)
  },
  {
    [Uml.Attributes.isMulticast]: 'false',
    [Uml.Attributes.isMultireceive]: 'false',
  },
)

function addEdge_selection(_objectFlow: GraphNode) {
  // TODO/Association
  // selection : Behavior [0..1] (opposite A_selection_objectFlow::objectFlow)
  // A Behavior used to select tokens from a source ObjectNode.
}

function addEdge_transformation(_objectFlow: GraphNode) {
  // TODO/Association
  // transformation : Behavior [0..1] (opposite A_transformation_objectFlow::objectFlow)
  // A Behavior used to change or replace object tokens flowing along the ObjectFlow.
}
