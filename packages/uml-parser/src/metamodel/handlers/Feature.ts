import type { GraphNode } from '@cm2ml/ir'

import { Classifier, Feature, getParentOfType } from '../metamodel'

export const FeatureHandler = Feature.createHandler(
  (feature, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_featuringClassifier(feature)
  },
)

function addEdge_featuringClassifier(feature: GraphNode) {
  const featuringClassifier = getParentOfType(feature, Classifier)
  if (!featuringClassifier) {
    return
  }
  feature.model.addEdge('featuringClassifier', feature, featuringClassifier)
}
