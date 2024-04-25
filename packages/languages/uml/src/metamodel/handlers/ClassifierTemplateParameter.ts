import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Classifier, ClassifierTemplateParameter } from '../uml-metamodel'

export const ClassifierTemplateParameterHandler =
  ClassifierTemplateParameter.createHandler(
    (classifierTemplateParameter, { onlyContainmentAssociations }) => {
      const constrainingClassifiers = resolve(classifierTemplateParameter, 'constrainingClassifier', { many: true, type: Classifier })
      const parameteredElement = resolve(classifierTemplateParameter, 'parameteredElement', { type: Classifier })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_constrainingClassifier(classifierTemplateParameter, constrainingClassifiers)
      addEdge_parameteredElement(classifierTemplateParameter, parameteredElement)
    },
    {
      [Uml.Attributes.allowSubstitutable]: { type: 'boolean', defaultValue: 'true' },
    },
  )

function addEdge_constrainingClassifier(
  classifierTemplateParameter: GraphNode,
  constrainingClassifiers: GraphNode[],
) {
  // constrainingClassifier : Classifier [0..*] (opposite A_constrainingClassifier_classifierTemplateParameter::classifierTemplateParameter )
  // The classifiers that constrain the argument that can be used for the parameter. If the allowSubstitutable attribute is true, then any Classifier that is compatible with this constraining Classifier can be substituted; otherwise, it must be either this Classifier or one of its specializations. If this property is empty, there are no constraints on the Classifier that can be used as an argument.
  constrainingClassifiers.forEach((constrainingClassifier) => {
    classifierTemplateParameter.model.addEdge('constrainingClassifier', classifierTemplateParameter, constrainingClassifier)
  })
}

function addEdge_parameteredElement(classifierTemplateParameter: GraphNode, parameteredElement: GraphNode | undefined) {
  // parameteredElement : Classifier [1..1]{redefines TemplateParameter::parameteredElement} (opposite Classifier::templateParameter)
  // The Classifier exposed by this ClassifierTemplateParameter.
  if (!parameteredElement) {
    return
  }
  classifierTemplateParameter.model.addEdge('parameteredElement', classifierTemplateParameter, parameteredElement)
}
