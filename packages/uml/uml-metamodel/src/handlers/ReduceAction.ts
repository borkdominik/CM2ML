import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ReduceAction } from '../uml-metamodel'

export const ReduceActionHandler = ReduceAction.createHandler(
  (reduceAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_collection(reduceAction)
    addEdge_reducer(reduceAction)
    addEdge_result(reduceAction)
  },
  {
    [Uml.Attributes.isOrdered]: 'false',
  },
)

function addEdge_collection(_reduceAction: GraphNode) {
  // TODO/Association
  // ♦ collection : InputPin [1..1]{subsets Action::input} (opposite A_collection_reduceAction::reduceAction)
  // The InputPin that provides the collection to be reduced.
}

function addEdge_reducer(_reduceAction: GraphNode) {
  // TODO/Association
  // reducer : Behavior [1..1] (opposite A_reducer_reduceAction::reduceAction)
  // A Behavior that is repreatedly applied to two elements of the input collection to produce a value that is of the same type as elements of the collection.
}

function addEdge_result(_reduceAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_reduceAction::reduceAction)
  // The output pin on which the result value is placed.
}
