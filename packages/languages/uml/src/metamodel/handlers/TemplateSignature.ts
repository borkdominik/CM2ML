import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { TemplateParameter, TemplateSignature } from '../uml-metamodel'

export const TemplateSignatureHandler = TemplateSignature.createHandler(
  (templateSignature, { onlyContainmentAssociations }) => {
    const parameters = resolve(templateSignature, 'parameter', { many: true, type: TemplateParameter })
    const ownedParameters = resolve(templateSignature, 'ownedParameter', { many: true, type: TemplateParameter })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedParameter(templateSignature, ownedParameters)
    addEdge_parameter(templateSignature, parameters)
    addEdge_template(templateSignature)
  },
)

function addEdge_ownedParameter(templateSignature: GraphNode, ownedParameters: GraphNode[]) {
  // ♦ ownedParameter : TemplateParameter [0..*]{ordered, subsets Element::ownedElement, subsets TemplateSignature::parameter} (opposite TemplateParameter::signature)
  // The formal parameters that are owned by this TemplateSignature.
  ownedParameters.forEach((ownedParameter) => {
    templateSignature.model.addEdge('ownedParameter', templateSignature, ownedParameter)
  })
}

function addEdge_parameter(templateSignature: GraphNode, parameters: GraphNode[]) {
  // parameter : TemplateParameter [1..*]{ordered} (opposite A_parameter_templateSignature::templateSignature)
  // The ordered set of all formal TemplateParameters for this TemplateSignature.
  parameters.forEach((parameter) => {
    templateSignature.model.addEdge('parameter', templateSignature, parameter)
  })
}

function addEdge_template(_templateSignature: GraphNode) {
  // template : TemplateableElement [1..1]{subsets Element::owner} (opposite TemplateableElement::ownedTemplateSignature)
  // The TemplateableElement that owns this TemplateSignature.

  // Addec by TemplateableElementHandler::addEdge_ownedTemplateSignature
}
