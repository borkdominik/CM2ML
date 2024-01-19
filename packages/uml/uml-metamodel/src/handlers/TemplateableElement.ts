import type { GraphNode } from '@cm2ml/ir'

import { TemplateableElement } from '../uml-metamodel'

export const TemplateableElementHandler = TemplateableElement.createHandler(
  (templateableElement, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedTemplateSignature(templateableElement)
    addEdge_templateBinding(templateableElement)
  },
)

function addEdge_ownedTemplateSignature(_templateableElement: GraphNode) {
  // TODO/Association
  // ♦ ownedTemplateSignature : TemplateSignature [0..1]{subsets Element::ownedElement} (opposite TemplateSignature::template)
  // The optional TemplateSignature specifying the formal TemplateParameters for this TemplateableElement. If a TemplateableElement has a TemplateSignature, then it is a template.
}

function addEdge_templateBinding(_templateableElement: GraphNode) {
  // TODO/Association
  // ♦ templateBinding : TemplateBinding [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite TemplateBinding::boundElement)
  // The optional TemplateBindings from this TemplateableElement to one or more templates.
}
