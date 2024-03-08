import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { transformNodeToEdgeCallback } from '../uml'
import { TemplateBinding, TemplateParameterSubstitution, TemplateSignature, TemplateableElement } from '../uml-metamodel'

export const TemplateBindingHandler = TemplateBinding.createHandler(
  (templateBinding, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const boundElement = getParentOfType(templateBinding, TemplateableElement)
    const parameterSubstitutions = resolve(templateBinding, 'parameterSubstitution', { many: true, type: TemplateParameterSubstitution })
    const signature = resolve(templateBinding, 'signature', { type: TemplateSignature })
    if (relationshipsAsEdges) {
      return transformNodeToEdgeCallback(templateBinding, boundElement, signature)
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_boundElement(templateBinding, boundElement)
    addEdge_parameterSubstitution(templateBinding, parameterSubstitutions)
    addEdge_signature(templateBinding, signature)
  },
)

function addEdge_boundElement(templateBinding: GraphNode, boundElement: GraphNode | undefined) {
  // boundElement : TemplateableElement [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite TemplateableElement::templateBinding)
  // The TemplateableElement that is bound by this TemplateBinding.
  if (!boundElement) {
    return
  }
  templateBinding.model.addEdge('boundElement', templateBinding, boundElement)
  templateBinding.model.addEdge('source', templateBinding, boundElement)
  templateBinding.model.addEdge('relatedElement', templateBinding, boundElement)
}

function addEdge_parameterSubstitution(templateBinding: GraphNode, parameterSubstitutions: GraphNode[]) {
  // ♦ parameterSubstitution : TemplateParameterSubstitution [0..*]{subsets Element::ownedElement} (opposite TemplateParameterSubstitution::templateBinding)
  // The TemplateParameterSubstitutions owned by this TemplateBinding.
  parameterSubstitutions.forEach((parameterSubstitution) => {
    templateBinding.model.addEdge('parameterSubstitution', templateBinding, parameterSubstitution)
  })
}

function addEdge_signature(templateBinding: GraphNode, signature: GraphNode | undefined) {
  // signature : TemplateSignature [1..1]{subsets DirectedRelationship::target} (opposite A_signature_templateBinding::templateBinding)
  // The TemplateSignature for the template that is the target of this TemplateBinding.
  if (!signature) {
    return
  }
  templateBinding.model.addEdge('signature', templateBinding, signature)
  templateBinding.model.addEdge('target', templateBinding, signature)
  templateBinding.model.addEdge('relatedElement', templateBinding, signature)
}
