import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ReclassifyObjectAction } from '../uml-metamodel'

export const ReclassifyObjectActionHandler =
  ReclassifyObjectAction.createHandler(
    (reclassifyObjectAction, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_newClassifier(reclassifyObjectAction)
      addEdge_object(reclassifyObjectAction)
      addEdge_oldClassifier(reclassifyObjectAction)
    },
    {
      [Uml.Attributes.isReplaceAll]: 'false',
    },
  )
function addEdge_newClassifier(_reclassifyObjectAction: GraphNode) {
  // TODO/Association
  // newClassifier : Classifier [0..*] (opposite A_newClassifier_reclassifyObjectAction::reclassifyObjectAction)
  // A set of Classifiers to be added to the Classifiers of the given object.
}

function addEdge_object(_reclassifyObjectAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_reclassifyObjectAction::reclassifyObjectAction)
  // The InputPin that holds the object to be reclassified.
}

function addEdge_oldClassifier(_reclassifyObjectAction: GraphNode) {
  // TODO/Association
  // oldClassifier : Classifier [0..*] (opposite A_oldClassifier_reclassifyObjectAction::reclassifyObjectAction)
  // A set of Classifiers to be removed from the Classifiers of the given object.
}
