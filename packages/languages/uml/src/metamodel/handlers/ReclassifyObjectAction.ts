import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Classifier, ReclassifyObjectAction } from '../uml-metamodel'

export const ReclassifyObjectActionHandler =
  ReclassifyObjectAction.createHandler(
    (reclassifyObjectAction, { onlyContainmentAssociations }) => {
      const newClassifiers = resolve(reclassifyObjectAction, 'newClassifier', { many: true, type: Classifier })
      const oldClassifiers = resolve(reclassifyObjectAction, 'oldClassifier', { many: true, type: Classifier })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_newClassifier(reclassifyObjectAction, newClassifiers)
      addEdge_object(reclassifyObjectAction)
      addEdge_oldClassifier(reclassifyObjectAction, oldClassifiers)
    },
    {
      [Uml.Attributes.isReplaceAll]: 'false',
    },
  )
function addEdge_newClassifier(reclassifyObjectAction: GraphNode, newClassifiers: GraphNode[]) {
  // newClassifier : Classifier [0..*] (opposite A_newClassifier_reclassifyObjectAction::reclassifyObjectAction)
  // A set of Classifiers to be added to the Classifiers of the given object.
  newClassifiers.forEach((newClassifier) => {
    reclassifyObjectAction.model.addEdge('newClassifier', reclassifyObjectAction, newClassifier)
  })
}

function addEdge_object(_reclassifyObjectAction: GraphNode) {
  // TODO/Association
  // ♦ object : InputPin [1..1]{subsets Action::input} (opposite A_object_reclassifyObjectAction::reclassifyObjectAction)
  // The InputPin that holds the object to be reclassified.
}

function addEdge_oldClassifier(reclassifyObjectAction: GraphNode, oldClassifiers: GraphNode[]) {
  // oldClassifier : Classifier [0..*] (opposite A_oldClassifier_reclassifyObjectAction::reclassifyObjectAction)
  // A set of Classifiers to be removed from the Classifiers of the given object.
  oldClassifiers.forEach((oldClassifier) => {
    reclassifyObjectAction.model.addEdge('oldClassifier', reclassifyObjectAction, oldClassifier)
  })
}
