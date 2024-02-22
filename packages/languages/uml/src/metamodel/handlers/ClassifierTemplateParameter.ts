import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { Uml } from '../uml'
import { ClassifierTemplateParameter } from '../uml-metamodel'

export const ClassifierTemplateParameterHandler =
  ClassifierTemplateParameter.createHandler(
    (classifierTemplateParameter, { onlyContainmentAssociations }) => {
      const parameteredElement = resolveFromAttribute(classifierTemplateParameter, 'parameteredElement')
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_constrainingClassifier(classifierTemplateParameter)
      addEdge_parameteredElement(classifierTemplateParameter, parameteredElement)
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

function addEdge_parameteredElement(classifierTemplateParameter: GraphNode, parameteredElement: GraphNode | undefined) {
  // parameteredElement : Classifier [1..1]{redefines TemplateParameter::parameteredElement} (opposite Classifier::templateParameter)
  // The Classifier exposed by this ClassifierTemplateParameter.
  if (!parameteredElement) {
    return
  }
  classifierTemplateParameter.model.addEdge('parameteredElement', classifierTemplateParameter, parameteredElement)
}
