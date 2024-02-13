import type { GraphNode } from '@cm2ml/ir'

import { CreateObjectAction } from '../uml-metamodel'

export const CreateObjectActionHandler = CreateObjectAction.createHandler(
  (createObjectAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_classifier(createObjectAction)
    addEdge_result(createObjectAction)
  },
)

function addEdge_classifier(_createObjectAction: GraphNode) {
  // TODO/Association
  // classifier : Classifier [1..1] (opposite A_classifier_createObjectAction::createObjectAction)
  // The Classifier to be instantiated.
}

function addEdge_result(_createObjectAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_createObjectAction::createObjectAction)
  // The OutputPin on which the newly created object is placed.
}
