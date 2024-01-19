import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ClassifierTemplateParameter } from '../uml-metamodel'

export const ClassifierTemplateParameterHandler =
  ClassifierTemplateParameter.createHandler(
    (classifierTemplateParameter, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_constrainingClassifier(classifierTemplateParameter)
      addEdge_parameteredElement(classifierTemplateParameter)
    },
    {
      [Uml.Attributes.allowSubstitutable]: 'true',
    },
  )

function addEdge_constrainingClassifier(
  _classifierTemplateParameter: GraphNode,
) {
  // TODO
  // constrainingClassifier : Classifier [0..*] (opposite A_constrainingClassifier_classifierTemplateParameter::classifierTemplateParameter )
  // The classifiers that constrain the argument that can be used for the parameter. If the allowSubstitutable attribute is true, then any Classifier that is compatible with this constraining Classifier can be substituted; otherwise, it must be either this Classifier or one of its specializations. If this property is empty, there are no constraints on the Classifier that can be used as an argument.
}

function addEdge_parameteredElement(_classifierTemplateParameter: GraphNode) {
  // TODO/Association
  // parameteredElement : Classifier [1..1]{redefines TemplateParameter::parameteredElement} (opposite Classifier::templateParameter)
  // The Classifier exposed by this ClassifierTemplateParameter.
}
