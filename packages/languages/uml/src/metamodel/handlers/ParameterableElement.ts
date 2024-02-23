import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ParameterableElement } from '../uml-metamodel'

export const ParameterableElementHandler = ParameterableElement.createHandler(
  (parameterableElement, { onlyContainmentAssociations }) => {
    const templateParameter = resolve(parameterableElement, 'templateParameter')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_owningTemplateParameter(parameterableElement)
    addEdge_templateParameter(parameterableElement, templateParameter)
  },
)

function addEdge_owningTemplateParameter(_parameterableElement: GraphNode) {
  // TODO/Association
  // owningTemplateParameter : TemplateParameter [0..1]{subsets ParameterableElement::templateParameter, subsets Element::owner} (opposite TemplateParameter::ownedParameteredElement)
  // The formal TemplateParameter that owns this ParameterableElement.
}

function addEdge_templateParameter(parameterableElement: GraphNode, templateParameter: GraphNode | undefined) {
  // templateParameter : TemplateParameter [0..1] (opposite TemplateParameter::parameteredElement)
  // The TemplateParameter that exposes this ParameterableElement as a formal parameter.
  if (!templateParameter) {
    return
  }
  parameterableElement.model.addEdge('templateParameter', parameterableElement, templateParameter)
}
