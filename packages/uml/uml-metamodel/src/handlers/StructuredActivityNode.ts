import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { StructuredActivityNode } from '../uml-metamodel'

export const StructuredActivityNodeHandler =
  StructuredActivityNode.createHandler(
    (structuredActivityNode, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_activity(structuredActivityNode)
      addEdge_edge(structuredActivityNode)
      addEdge_node(structuredActivityNode)
      addEdge_structuredNodeInput(structuredActivityNode)
      addEdge_structuredNodeOutput(structuredActivityNode)
      addEdge_variable(structuredActivityNode)
    },
    {
      [Uml.Attributes.mustIsolate]: 'false',
    },
  )

function addEdge_activity(_structuredActivityNode: GraphNode) {
  // TODO/Association
  // activity : Activity [0..1]{redefines ActivityGroup::inActivity, redefines ActivityNode::activity} (opposite Activity::structuredNode)
  // The Activity immediately containing the StructuredActivityNode, if it is not contained in another StructuredActivityNode.
}

function addEdge_edge(_structuredActivityNode: GraphNode) {
  // TODO/Association
  // ♦ edge : ActivityEdge [0..*]{subsets ActivityGroup::containedEdge, subsets Element::ownedElement} (opposite ActivityEdge::inStructuredNode)
  // The ActivityEdges immediately contained in the StructuredActivityNode.
}

function addEdge_node(_structuredActivityNode: GraphNode) {
  // TODO/Association
  // ♦ node : ActivityNode [0..*]{subsets Element::ownedElement, subsets ActivityGroup::containedNode} (opposite ActivityNode::inStructuredNode)
  // The ActivityNodes immediately contained in the StructuredActivityNode.
}

function addEdge_structuredNodeInput(_structuredActivityNode: GraphNode) {
  // TODO/Association
  // ♦ structuredNodeInput : InputPin [0..*]{subsets Action::input} (opposite A_structuredNodeInput_structuredActivityNode::structuredActivityNode)
  // The InputPins owned by the StructuredActivityNode.
}

function addEdge_structuredNodeOutput(_structuredActivityNode: GraphNode) {
  // TODO/Association
  // ♦ structuredNodeOutput : OutputPin [0..*]{subsets Action::output} (opposite A_structuredNodeOutput_structuredActivityNode::structuredActivityNode)
  // The OutputPins owned by the StructuredActivityNode.
}

function addEdge_variable(_structuredActivityNode: GraphNode) {
  // TODO/Association
  // ♦ variable : Variable [0..*]{subsets Namespace::ownedMember} (opposite Variable::scope)
  // The Variables defined in the scope of the StructuredActivityNode.
}
