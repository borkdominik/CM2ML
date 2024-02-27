import type { GraphNode } from '@cm2ml/ir'

import { RedefinableTemplateSignature } from '../uml-metamodel'

export const RedefinableTemplateSignatureHandler =
  RedefinableTemplateSignature.createHandler(
    (redefinableTemplateSignature, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_classifier(redefinableTemplateSignature)
      addEdge_extendedSignature(redefinableTemplateSignature)
      addEdge_inheritedParameter(redefinableTemplateSignature)
    },
  )

function addEdge_classifier(_redefinableTemplateSignature: GraphNode) {
  // TODO/Association
  // classifier : Classifier [1..1]{subsets RedefinableElement::redefinitionContext, redefines TemplateSignature::template} (opposite Classifier::ownedTemplateSignature)
  // The The Classifier that owns this RedefinableTemplateSignature.
}

function addEdge_extendedSignature(_redefinableTemplateSignature: GraphNode) {
  // TODO/Association
  // extendedSignature : RedefinableTemplateSignature [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_extendedSignature_redefinableTemplateSignature::redefinableTemplateSignature)
  // The signatures extended by this RedefinableTemplateSignature.
}

function addEdge_inheritedParameter(_redefinableTemplateSignature: GraphNode) {
  // TODO/Association
  // /inheritedParameter : TemplateParameter [0..*]{subsets TemplateSignature::parameter} (opposite A_inheritedParameter_redefinableTemplateSignature::redefinableTemplateSignature )
  // The formal template parameters of the extended signatures.
}
