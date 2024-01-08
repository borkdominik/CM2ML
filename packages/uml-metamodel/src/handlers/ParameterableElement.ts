import type { GraphNode } from '@cm2ml/ir'

import { ParameterableElement } from '../uml-metamodel'

export const ParameterableElementHandler = ParameterableElement.createHandler(
  (parameterableElement, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_owningTemplateParameter(parameterableElement)
    addEdge_templateParameter(parameterableElement)
  },
)

function addEdge_owningTemplateParameter(_parameterableElement: GraphNode) {
  // TODO
  // owningTemplateParameter : TemplateParameter [0..1]{subsets ParameterableElement::templateParameter, subsets Element::owner} (opposite TemplateParameter::ownedParameteredElement)
  // The formal TemplateParameter that owns this ParameterableElement.
}

function addEdge_templateParameter(_parameterableElement: GraphNode) {
  // TODO
  // templateParameter : TemplateParameter [0..1] (opposite TemplateParameter::parameteredElement)
  // The TemplateParameter that exposes this ParameterableElement as a formal parameter.
}
