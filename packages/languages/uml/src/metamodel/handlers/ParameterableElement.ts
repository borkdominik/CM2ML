import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ParameterableElement, TemplateParameter } from '../uml-metamodel'

export const ParameterableElementHandler = ParameterableElement.createHandler(
  (parameterableElement, { onlyContainmentAssociations }) => {
    const owningTemplateParameter = resolve(parameterableElement, 'owningTemplateParameter', { type: TemplateParameter })
    const templateParameter = resolve(parameterableElement, 'templateParameter', { type: TemplateParameter })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_owningTemplateParameter(parameterableElement, owningTemplateParameter)
    addEdge_templateParameter(parameterableElement, templateParameter)
  },
)

function addEdge_owningTemplateParameter(parameterableElement: GraphNode, owningTemplateParameter: GraphNode | undefined) {
  // owningTemplateParameter : TemplateParameter [0..1]{subsets ParameterableElement::templateParameter, subsets Element::owner} (opposite TemplateParameter::ownedParameteredElement)
  // The formal TemplateParameter that owns this ParameterableElement.
  if (!owningTemplateParameter) {
    return
  }
  parameterableElement.model.addEdge('owningTemplateParameter', parameterableElement, owningTemplateParameter)
}

function addEdge_templateParameter(parameterableElement: GraphNode, templateParameter: GraphNode | undefined) {
  // templateParameter : TemplateParameter [0..1] (opposite TemplateParameter::parameteredElement)
  // The TemplateParameter that exposes this ParameterableElement as a formal parameter.
  if (!templateParameter) {
    return
  }
  parameterableElement.model.addEdge('templateParameter', parameterableElement, templateParameter)
}
