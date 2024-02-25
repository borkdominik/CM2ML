import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { InputPin, OutputPin, StructuredActivityNode, Variable } from '../uml-metamodel'

export const StructuredActivityNodeHandler =
  StructuredActivityNode.createHandler(
    (structuredActivityNode, { onlyContainmentAssociations }) => {
      const structuredNodeInputs = resolve(structuredActivityNode, 'structuredNodeInput', { many: true, type: InputPin })
      const structuredNodeOutputs = resolve(structuredActivityNode, 'structuredNodeOutput', { many: true, type: OutputPin })
      const variables = resolve(structuredActivityNode, 'variable', { many: true, type: Variable })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_activity(structuredActivityNode)
      addEdge_edge(structuredActivityNode)
      addEdge_node(structuredActivityNode)
      addEdge_structuredNodeInput(structuredActivityNode, structuredNodeInputs)
      addEdge_structuredNodeOutput(structuredActivityNode, structuredNodeOutputs)
      addEdge_variable(structuredActivityNode, variables)
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

function addEdge_structuredNodeInput(structuredActivityNode: GraphNode, structuredNodeInputs: GraphNode[]) {
  // ♦ structuredNodeInput : InputPin [0..*]{subsets Action::input} (opposite A_structuredNodeInput_structuredActivityNode::structuredActivityNode)
  // The InputPins owned by the StructuredActivityNode.
  structuredNodeInputs.forEach((structuredNodeInput) => {
    structuredActivityNode.model.addEdge('structuredNodeInput', structuredActivityNode, structuredNodeInput)
  })
}

function addEdge_structuredNodeOutput(structuredActivityNode: GraphNode, structuredNodeOutputs: GraphNode[]) {
  // ♦ structuredNodeOutput : OutputPin [0..*]{subsets Action::output} (opposite A_structuredNodeOutput_structuredActivityNode::structuredActivityNode)
  // The OutputPins owned by the StructuredActivityNode.
  structuredNodeOutputs.forEach((structuredNodeOutput) => {
    structuredActivityNode.model.addEdge('structuredNodeOutput', structuredActivityNode, structuredNodeOutput)
  })
}

function addEdge_variable(structuredActivityNode: GraphNode, variables: GraphNode[]) {
  // ♦ variable : Variable [0..*]{subsets Namespace::ownedMember} (opposite Variable::scope)
  // The Variables defined in the scope of the StructuredActivityNode.
  variables.forEach((variable) => {
    structuredActivityNode.model.addEdge('variable', structuredActivityNode, variable)
  })
}
