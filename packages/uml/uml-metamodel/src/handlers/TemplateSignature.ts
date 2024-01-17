import type { GraphNode } from '@cm2ml/ir'

import { TemplateSignature } from '../uml-metamodel'

export const TemplateSignatureHandler = TemplateSignature.createHandler(
  (templateSignature, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedParameter(templateSignature)
    addEdge_parameter(templateSignature)
    addEdge_template(templateSignature)
  },
)

function addEdge_ownedParameter(_templateSignature: GraphNode) {
  // TODO
  // ♦ ownedParameter : TemplateParameter [0..*]{ordered, subsets Element::ownedElement, subsets TemplateSignature::parameter} (opposite TemplateParameter::signature)
  // The formal parameters that are owned by this TemplateSignature.
}

function addEdge_parameter(_templateSignature: GraphNode) {
  // TODO
  // parameter : TemplateParameter [1..*]{ordered} (opposite A_parameter_templateSignature::templateSignature)
  // The ordered set of all formal TemplateParameters for this TemplateSignature.
}

function addEdge_template(_templateSignature: GraphNode) {
  // TODO
  // template : TemplateableElement [1..1]{subsets Element::owner} (opposite TemplateableElement::ownedTemplateSignature)
  // The TemplateableElement that owns this TemplateSignature.
}
