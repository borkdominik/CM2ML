import type { GraphNode } from '@cm2ml/ir'

import { TemplateBinding } from '../uml-metamodel'

export const TemplateBindingHandler = TemplateBinding.createHandler(
  (templateBinding, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_boundElement(templateBinding)
    addEdge_parameterSubstitution(templateBinding)
    addEdge_signature(templateBinding)
  },
)

function addEdge_boundElement(_templateBinding: GraphNode) {
  // TODO
  // boundElement : TemplateableElement [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite TemplateableElement::templateBinding)
  // The TemplateableElement that is bound by this TemplateBinding.
}

function addEdge_parameterSubstitution(_templateBinding: GraphNode) {
  // TODO
  // ♦ parameterSubstitution : TemplateParameterSubstitution [0..*]{subsets Element::ownedElement} (opposite TemplateParameterSubstitution::templateBinding)
  // The TemplateParameterSubstitutions owned by this TemplateBinding.
}

function addEdge_signature(_templateBinding: GraphNode) {
  // TODO
  // signature : TemplateSignature [1..1]{subsets DirectedRelationship::target} (opposite A_signature_templateBinding::templateBinding)
  // The TemplateSignature for the template that is the target of this TemplateBinding.
}
