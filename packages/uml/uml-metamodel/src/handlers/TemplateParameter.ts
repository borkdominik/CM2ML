import type { GraphNode } from '@cm2ml/ir'

import { TemplateParameter } from '../uml-metamodel'

export const TemplateParameterHandler = TemplateParameter.createHandler(
  (templateParameter, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_default(templateParameter)
    addEdge_ownedDefault(templateParameter)
    addEdge_ownedParameteredElement(templateParameter)
    addEdge_parameteredElement(templateParameter)
    addEdge_signature(templateParameter)
  },
)

function addEdge_default(_templateParameter: GraphNode) {
  // TODO
  // default : ParameterableElement [0..1] (opposite A_default_templateParameter::templateParameter)
  // The ParameterableElement that is the default for this formal TemplateParameter.
}

function addEdge_ownedDefault(_templateParameter: GraphNode) {
  // TODO
  // ♦ ownedDefault : ParameterableElement [0..1]{subsets Element::ownedElement, subsets TemplateParameter::default} (opposite A_ownedDefault_templateParameter::templateParameter)
  // The ParameterableElement that is owned by this TemplateParameter for the purpose of providing a default.
}

function addEdge_ownedParameteredElement(_templateParameter: GraphNode) {
  // TODO
  // ♦ ownedParameteredElement : ParameterableElement [0..1]{subsets Element::ownedElement, subsets TemplateParameter::parameteredElement} (opposite ParameterableElement::owningTemplateParameter)
  // The ParameterableElement that is owned by this TemplateParameter for the purpose of exposing it as the parameteredElement.
}

function addEdge_parameteredElement(_templateParameter: GraphNode) {
  // TODO
  // parameteredElement : ParameterableElement [1..1] (opposite ParameterableElement::templateParameter)
  // The ParameterableElement exposed by this TemplateParameter.
}

function addEdge_signature(_templateParameter: GraphNode) {
  // TODO
  // signature : TemplateSignature [1..1]{subsets A_parameter_templateSignature::templateSignature, subsets Element::owner} (opposite TemplateSignature::ownedParameter)
  // The TemplateSignature that owns this TemplateParameter.
}
