import type { GraphNode } from '@cm2ml/ir'

import { TestIdentityAction } from '../uml-metamodel'

export const TestIdentityActionHandler = TestIdentityAction.createHandler(
  (testIdentityAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_first(testIdentityAction)
    addEdge_result(testIdentityAction)
    addEdge_second(testIdentityAction)
  },
)
function addEdge_first(_testIdentityAction: GraphNode) {
  // TODO/Association
  // ♦ first : InputPin [1..1]{subsets Action::input} (opposite A_first_testIdentityAction::testIdentityAction)
  // The InputPin on which the first input object is placed.
}

function addEdge_result(_testIdentityAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_testIdentityAction::testIdentityAction)
  // The OutputPin whose Boolean value indicates whether the two input objects are identical.
}

function addEdge_second(_testIdentityAction: GraphNode) {
  // TODO/Association
  // ♦ second : InputPin [1..1]{subsets Action::input} (opposite A_second_testIdentityAction::testIdentityAction)
  // The OutputPin on which the second input object is placed.
}
