import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { LoopNode } from '../uml-metamodel'

export const LoopNodeHandler = LoopNode.createHandler(
  (loopNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_bodyOutput(loopNode)
    addEdge_bodyPart(loopNode)
    addEdge_decider(loopNode)
    addEdge_loopVariable(loopNode)
    addEdge_loopVariableInput(loopNode)
    addEdge_result(loopNode)
    addEdge_setupPart(loopNode)
    addEdge_test(loopNode)
  },
  {
    [Uml.Attributes.isTestedFirst]: 'false',
  },
)

function addEdge_bodyOutput(_loopNode: GraphNode) {
  // TODO/Association
  // bodyOutput : OutputPin [0..*]{ordered} (opposite A_bodyOutput_loopNode::loopNode)
  // The OutputPins on Actions within the bodyPart, the values of which are moved to the loopVariable OutputPins after the completion of each execution of the bodyPart, before the next iteration of the loop begins or before the loop exits.
}

function addEdge_bodyPart(_loopNode: GraphNode) {
  // TODO/Association
  // bodyPart : ExecutableNode [0..*] (opposite A_bodyPart_loopNode::loopNode)
  // The set of ExecutableNodes that perform the repetitive computations of the loop. The bodyPart is executed as long as the test section produces a true value.
}

function addEdge_decider(_loopNode: GraphNode) {
  // TODO/Association
  // decider : OutputPin [1..1] (opposite A_decider_loopNode::loopNode)
  // An OutputPin on an Action in the test section whose Boolean value determines whether to continue executing the loop bodyPart.
}

function addEdge_loopVariable(_loopNode: GraphNode) {
  // TODO/Association
  // ♦ loopVariable : OutputPin [0..*]{ordered, subsets Element::ownedElement} (opposite A_loopVariable_loopNode::loopNode)
  // A list of OutputPins that hold the values of the loop variables during an execution of the loop. When the test fails, the values are moved to the result OutputPins of the loop.
}

function addEdge_loopVariableInput(_loopNode: GraphNode) {
  // TODO/Association
  // ♦ loopVariableInput : InputPin [0..*]{ordered, redefines StructuredActivityNode::structuredNodeInput} (opposite A_loopVariableInput_loopNode::loopNode)
  // A list of InputPins whose values are moved into the loopVariable Pins before the first iteration of the loop.
}

function addEdge_result(_loopNode: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [0..*]{ordered, redefines StructuredActivityNode::structuredNodeOutput} (opposite A_result_loopNode::loopNode)
  // A list of OutputPins that receive the loopVariable values after the last iteration of the loop and constitute the output of the LoopNode.
}

function addEdge_setupPart(_loopNode: GraphNode) {
  // TODO/Association
  // setupPart : ExecutableNode [0..*] (opposite A_setupPart_loopNode::loopNode)
  // The set of ExecutableNodes executed before the first iteration of the loop, in order to initialize values or perform other setup computations.
}

function addEdge_test(_loopNode: GraphNode) {
  // TODO/Association
  // test : ExecutableNode [1..*] (opposite A_test_loopNode::loopNode)
  // The set of ExecutableNodes executed in order to provide the test result for the loop.
}
