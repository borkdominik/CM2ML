import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { TemplateParameter, TemplateSignature } from '../uml-metamodel'

export const TemplateSignatureHandler = TemplateSignature.createHandler(
  (templateSignature, { onlyContainmentAssociations }) => {
    const parameters = resolveFromAttribute(templateSignature, 'parameter', { many: true, type: TemplateParameter })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedParameter(templateSignature)
    addEdge_parameter(templateSignature, parameters)
    addEdge_template(templateSignature)
  },
)

function addEdge_ownedParameter(_templateSignature: GraphNode) {
  // TODO/Association
  // ♦ ownedParameter : TemplateParameter [0..*]{ordered, subsets Element::ownedElement, subsets TemplateSignature::parameter} (opposite TemplateParameter::signature)
  // The formal parameters that are owned by this TemplateSignature.
}

function addEdge_parameter(templateSignature: GraphNode, parameters: GraphNode[]) {
  // parameter : TemplateParameter [1..*]{ordered} (opposite A_parameter_templateSignature::templateSignature)
  // The ordered set of all formal TemplateParameters for this TemplateSignature.
  parameters.forEach((parameter) => {
    templateSignature.model.addEdge('parameter', templateSignature, parameter)
  })
}

function addEdge_template(_templateSignature: GraphNode) {
  // TODO/Association
  // template : TemplateableElement [1..1]{subsets Element::owner} (opposite TemplateableElement::ownedTemplateSignature)
  // The TemplateableElement that owns this TemplateSignature.
}
