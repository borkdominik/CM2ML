import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { TemplateBinding, TemplateSignature, TemplateableElement } from '../uml-metamodel'

export const TemplateableElementHandler = TemplateableElement.createHandler(
  (templateableElement, { onlyContainmentAssociations }) => {
    const ownedTemplateSignature = resolve(templateableElement, 'ownedTemplateSignature', { type: TemplateSignature })
    const templateBinding = resolve(templateableElement, 'templateBinding', { many: true, type: TemplateBinding })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_ownedTemplateSignature(templateableElement, ownedTemplateSignature)
    addEdge_templateBinding(templateableElement, templateBinding)
  },
)

function addEdge_ownedTemplateSignature(templateableElement: GraphNode, ownedTemplateSignature: GraphNode | undefined) {
  // ♦ ownedTemplateSignature : TemplateSignature [0..1]{subsets Element::ownedElement} (opposite TemplateSignature::template)
  // The optional TemplateSignature specifying the formal TemplateParameters for this TemplateableElement. If a TemplateableElement has a TemplateSignature, then it is a template.
  if (!ownedTemplateSignature) {
    return
  }
  templateableElement.model.addEdge('ownedTemplateSignature', templateableElement, ownedTemplateSignature)
}

function addEdge_templateBinding(templateableElement: GraphNode, templateBinding: GraphNode[]) {
  // ♦ templateBinding : TemplateBinding [0..*]{subsets Element::ownedElement, subsets A_source_directedRelationship::directedRelationship} (opposite TemplateBinding::boundElement)
  // The optional TemplateBindings from this TemplateableElement to one or more templates.
  templateBinding.forEach((templateBinding) => {
    templateableElement.model.addEdge('templateBinding', templateableElement, templateBinding)
  })
}
