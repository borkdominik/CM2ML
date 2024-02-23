import type { GraphNode } from '@cm2ml/ir'

import { resolveFromChild } from '../resolvers/resolve'
import { InputPin, OutputPin, TestIdentityAction } from '../uml-metamodel'

export const TestIdentityActionHandler = TestIdentityAction.createHandler(
  (testIdentityAction, { onlyContainmentAssociations }) => {
    const first = resolveFromChild(testIdentityAction, 'first', { type: InputPin })
    const result = resolveFromChild(testIdentityAction, 'result', { type: OutputPin })
    const second = resolveFromChild(testIdentityAction, 'second', { type: InputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_first(testIdentityAction, first)
    addEdge_result(testIdentityAction, result)
    addEdge_second(testIdentityAction, second)
  },
)
function addEdge_first(testIdentityAction: GraphNode, first: GraphNode | undefined) {
  // ♦ first : InputPin [1..1]{subsets Action::input} (opposite A_first_testIdentityAction::testIdentityAction)
  // The InputPin on which the first input object is placed.
  if (!first) {
    return
  }
  testIdentityAction.model.addEdge('first', testIdentityAction, first)
}

function addEdge_result(testIdentityAction: GraphNode, result: GraphNode | undefined) {
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_testIdentityAction::testIdentityAction)
  // The OutputPin whose Boolean value indicates whether the two input objects are identical.
  if (!result) {
    return
  }
  testIdentityAction.model.addEdge('result', testIdentityAction, result)
}

function addEdge_second(testIdentityAction: GraphNode, second: GraphNode | undefined) {
  // ♦ second : InputPin [1..1]{subsets Action::input} (opposite A_second_testIdentityAction::testIdentityAction)
  // The OutputPin on which the second input object is placed.
  if (!second) {
    return
  }
  testIdentityAction.model.addEdge('second', testIdentityAction, second)
}
