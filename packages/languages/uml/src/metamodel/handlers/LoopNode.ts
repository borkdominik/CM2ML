import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ExecutableNode, LoopNode, OutputPin } from '../uml-metamodel'

export const LoopNodeHandler = LoopNode.createHandler(
  (loopNode, { onlyContainmentAssociations }) => {
    const bodyOutputs = resolve(loopNode, 'bodyOutput', { many: true, type: OutputPin })
    const bodyParts = resolve(loopNode, 'bodyPart', { many: true, type: ExecutableNode })
    const decider = resolve(loopNode, 'decider', { type: OutputPin })
    const loopVariables = resolve(loopNode, 'loopVariable', { many: true, type: OutputPin })
    const setupParts = resolve(loopNode, 'setupPart', { many: true, type: ExecutableNode })
    const tests = resolve(loopNode, 'test', { many: true, type: ExecutableNode })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_bodyOutput(loopNode, bodyOutputs)
    addEdge_bodyPart(loopNode, bodyParts)
    addEdge_decider(loopNode, decider)
    addEdge_loopVariable(loopNode, loopVariables)
    addEdge_loopVariableInput(loopNode)
    addEdge_result(loopNode)
    addEdge_setupPart(loopNode, setupParts)
    addEdge_test(loopNode, tests)
  },
  {
    [Uml.Attributes.isTestedFirst]: 'false',
  },
)

function addEdge_bodyOutput(loopNode: GraphNode, bodyOutputs: GraphNode[]) {
  // bodyOutput : OutputPin [0..*]{ordered} (opposite A_bodyOutput_loopNode::loopNode)
  // The OutputPins on Actions within the bodyPart, the values of which are moved to the loopVariable OutputPins after the completion of each execution of the bodyPart, before the next iteration of the loop begins or before the loop exits.
  bodyOutputs.forEach((bodyOutput) => {
    loopNode.model.addEdge('bodyOutput', loopNode, bodyOutput)
  })
}

function addEdge_bodyPart(loopNode: GraphNode, bodyParts: GraphNode[]) {
  // bodyPart : ExecutableNode [0..*] (opposite A_bodyPart_loopNode::loopNode)
  // The set of ExecutableNodes that perform the repetitive computations of the loop. The bodyPart is executed as long as the test section produces a true value.
  bodyParts.forEach((bodyPart) => {
    loopNode.model.addEdge('bodyPart', loopNode, bodyPart)
  })
}

function addEdge_decider(loopNode: GraphNode, decider: GraphNode | undefined) {
  // decider : OutputPin [1..1] (opposite A_decider_loopNode::loopNode)
  // An OutputPin on an Action in the test section whose Boolean value determines whether to continue executing the loop bodyPart.
  if (!decider) {
    return
  }
  loopNode.model.addEdge('decider', loopNode, decider)
}

function addEdge_loopVariable(loopNode: GraphNode, loopVariables: GraphNode[]) {
  // ♦ loopVariable : OutputPin [0..*]{ordered, subsets Element::ownedElement} (opposite A_loopVariable_loopNode::loopNode)
  // A list of OutputPins that hold the values of the loop variables during an execution of the loop. When the test fails, the values are moved to the result OutputPins of the loop.
  loopVariables.forEach((loopVariable) => {
    loopNode.model.addEdge('loopVariable', loopNode, loopVariable)
  })
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

function addEdge_setupPart(loopNode: GraphNode, setupParts: GraphNode[]) {
  // setupPart : ExecutableNode [0..*] (opposite A_setupPart_loopNode::loopNode)
  // The set of ExecutableNodes executed before the first iteration of the loop, in order to initialize values or perform other setup computations.
  setupParts.forEach((setupPart) => {
    loopNode.model.addEdge('setupPart', loopNode, setupPart)
  })
}

function addEdge_test(loopNode: GraphNode, tests: GraphNode[]) {
  // test : ExecutableNode [1..*] (opposite A_test_loopNode::loopNode)
  // The set of ExecutableNodes executed in order to provide the test result for the loop.
  tests.forEach((test) => {
    loopNode.model.addEdge('test', loopNode, test)
  })
}
