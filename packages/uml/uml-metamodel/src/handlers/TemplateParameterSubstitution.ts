import type { GraphNode } from '@cm2ml/ir'

import { TemplateParameterSubstitution } from '../uml-metamodel'

export const TemplateParameterSubstitutionHandler =
  TemplateParameterSubstitution.createHandler(
    (templateParameterSubstitution, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_actual(templateParameterSubstitution)
      addEdge_formal(templateParameterSubstitution)
      addEdge_ownedActual(templateParameterSubstitution)
      addEdge_templateBinding(templateParameterSubstitution)
    },
  )

function addEdge_actual(_templateParameterSubstitution: GraphNode) {
  // TODO/Association
  // actual : ParameterableElement [1..1] (opposite A_actual_templateParameterSubstitution::templateParameterSubstitution)
  // The ParameterableElement that is the actual parameter for this TemplateParameterSubstitution.
}

function addEdge_formal(_templateParameterSubstitution: GraphNode) {
  // TODO/Association
  // formal : TemplateParameter [1..1] (opposite A_formal_templateParameterSubstitution::templateParameterSubstitution)
  // The formal TemplateParameter that is associated with this TemplateParameterSubstitution.
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
