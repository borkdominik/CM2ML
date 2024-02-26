import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute, resolveFromChild } from '../resolvers/resolve'
import { ParameterableElement, TemplateParameter } from '../uml-metamodel'

export const TemplateParameterHandler = TemplateParameter.createHandler(
  (templateParameter, { onlyContainmentAssociations }) => {
    const parameteredElement = resolveFromAttribute(templateParameter, 'parameteredElement', { type: ParameterableElement })
    const ownedParameteredElement = resolveFromChild(templateParameter, 'ownedParameteredElement', { type: ParameterableElement })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_default(templateParameter)
    addEdge_ownedDefault(templateParameter)
    addEdge_ownedParameteredElement(templateParameter, ownedParameteredElement)
    addEdge_parameteredElement(templateParameter, parameteredElement)
    addEdge_signature(templateParameter)
  },
)

function addEdge_default(_templateParameter: GraphNode) {
  // TODO/Association
  // default : ParameterableElement [0..1] (opposite A_default_templateParameter::templateParameter)
  // The ParameterableElement that is the default for this formal TemplateParameter.
}

function addEdge_ownedDefault(_templateParameter: GraphNode) {
  // TODO/Association
  // ♦ ownedDefault : ParameterableElement [0..1]{subsets Element::ownedElement, subsets TemplateParameter::default} (opposite A_ownedDefault_templateParameter::templateParameter)
  // The ParameterableElement that is owned by this TemplateParameter for the purpose of providing a default.
}

function addEdge_ownedParameteredElement(templateParameter: GraphNode, ownedParameteredElement: GraphNode | undefined) {
  // ♦ ownedParameteredElement : ParameterableElement [0..1]{subsets Element::ownedElement, subsets TemplateParameter::parameteredElement} (opposite ParameterableElement::owningTemplateParameter)
  // The ParameterableElement that is owned by this TemplateParameter for the purpose of exposing it as the parameteredElement.
  if (!ownedParameteredElement) {
    return
  }
  templateParameter.model.addEdge('ownedParameteredElement', templateParameter, ownedParameteredElement)
}

function addEdge_parameteredElement(templateParameter: GraphNode, parameteredElement: GraphNode | undefined) {
  // parameteredElement : ParameterableElement [1..1] (opposite ParameterableElement::templateParameter)
  // The ParameterableElement exposed by this TemplateParameter.
  if (!parameteredElement) {
    return
  }
  templateParameter.model.addEdge('parameteredElement', templateParameter, parameteredElement)
}

function addEdge_signature(_templateParameter: GraphNode) {
  // TODO/Association
  // signature : TemplateSignature [1..1]{subsets A_parameter_templateSignature::templateSignature, subsets Element::owner} (opposite TemplateSignature::ownedParameter)
  // The TemplateSignature that owns this TemplateParameter.
}
