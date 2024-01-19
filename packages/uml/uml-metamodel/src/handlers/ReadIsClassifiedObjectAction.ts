import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ReadIsClassifiedObjectAction } from '../uml-metamodel'

export const ReadIsClassifiedObjectActionHandler =
  ReadIsClassifiedObjectAction.createHandler(
    (readIsClassifiedObjectAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_classifier(readIsClassifiedObjectAction)
      addEdge_object(readIsClassifiedObjectAction)
      addEdge_result(readIsClassifiedObjectAction)
    },
    {
      [Uml.Attributes.isDirect]: 'false',
    },
  )

function addEdge_classifier(_readIsClassifiedObjectAction: GraphNode) {
  // TODO/Association
  // classifier : Classifier [1..1] (opposite A_classifier_readIsClassifiedObjectAction::readIsClassifiedObjectAction)
  // The Classifier against which the classification of the input object is tested.
}

function addEdge_object(_readIsClassifiedObjectAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_readIsClassifiedObjectAction::readIsClassifiedObjectAction)
  // The InputPin that holds the object whose classification is to be tested.
}

function addEdge_result(_readIsClassifiedObjectAction: GraphNode) {
  // TODO/Association
  // ♦ result : OutputPin [1..1]{subsets Action::output} (opposite A_result_readIsClassifiedObjectAction::readIsClassifiedObjectAction)
  // The OutputPin that holds the Boolean result of the test.
}
