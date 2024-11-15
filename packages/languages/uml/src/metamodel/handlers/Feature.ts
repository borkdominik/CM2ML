import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { Uml } from '../uml'
import { Classifier, Feature } from '../uml-metamodel'

export const FeatureHandler = Feature.createHandler(
  (feature, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_featuringClassifier(feature)
  },
  {
    [Uml.Attributes.isStatic]: { type: 'boolean', defaultValue: 'false' },
  },
)

function addEdge_featuringClassifier(feature: GraphNode) {
  const featuringClassifier = getParentOfType(feature, Classifier)
  if (!featuringClassifier) {
    return
  }
  feature.model.addEdge('featuringClassifier', feature, featuringClassifier)
  featuringClassifier.model.addEdge('feature', featuringClassifier, feature)
}
