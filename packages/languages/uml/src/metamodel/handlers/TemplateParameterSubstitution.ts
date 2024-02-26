import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/resolve'
import { ParameterableElement, TemplateParameter, TemplateParameterSubstitution } from '../uml-metamodel'

export const TemplateParameterSubstitutionHandler =
  TemplateParameterSubstitution.createHandler(
    (templateParameterSubstitution, { onlyContainmentAssociations }) => {
      const actual = resolveFromAttribute(templateParameterSubstitution, 'actual', { type: ParameterableElement })
      const formal = resolveFromAttribute(templateParameterSubstitution, 'formal', { type: TemplateParameter })
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_actual(templateParameterSubstitution, actual)
      addEdge_formal(templateParameterSubstitution, formal)
      addEdge_ownedActual(templateParameterSubstitution)
      addEdge_templateBinding(templateParameterSubstitution)
    },
  )

function addEdge_actual(templateParameterSubstitution: GraphNode, actual: GraphNode | undefined) {
  // actual : ParameterableElement [1..1] (opposite A_actual_templateParameterSubstitution::templateParameterSubstitution)
  // The ParameterableElement that is the actual parameter for this TemplateParameterSubstitution.
  if (!actual) {
    return
  }
  templateParameterSubstitution.model.addEdge('actual', templateParameterSubstitution, actual)
}

function addEdge_formal(templateParameterSubstitution: GraphNode, formal: GraphNode | undefined) {
  // formal : TemplateParameter [1..1] (opposite A_formal_templateParameterSubstitution::templateParameterSubstitution)
  // The formal TemplateParameter that is associated with this TemplateParameterSubstitution.
  if (!formal) {
    return
  }
  templateParameterSubstitution.model.addEdge('formal', templateParameterSubstitution, formal)
}

function addEdge_ownedActual(_templateParameterSubstitution: GraphNode) {
  // TODO/Association
  // ♦ ownedActual : ParameterableElement [0..1]{subsets Element::ownedElement, subsets TemplateParameterSubstitution::actual} (opposite A_ownedActual_owningTemplateParameterSubstitution::owningTemplateParameterSubstitution)
  // The ParameterableElement that is owned by this TemplateParameterSubstitution as its actual parameter.
}

function addEdge_templateBinding(_templateParameterSubstitution: GraphNode) {
  // TODO/Association
  // templateBinding : TemplateBinding [1..1]{subsets Element::owner} (opposite TemplateBinding::parameterSubstitution)
  // The TemplateBinding that owns this TemplateParameterSubstitution.
}
