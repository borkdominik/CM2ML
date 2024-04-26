import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import {
  Constraint,
  Operation,
  OperationTemplateParameter,
  Parameter,
  Type,
} from '../uml-metamodel'

export const OperationHandler = Operation.createHandler(
  (operation, { onlyContainmentAssociations }) => {
    removeInvalidInputOutputAttributes(operation)
    const bodyCondition = resolve(operation, 'bodyCondition', { type: Constraint })
    const ownedParameters = resolve(operation, 'ownedParameter', { many: true, type: Parameter })
    const postconditions = resolve(operation, 'postcondition', { many: true, type: Constraint })
    const preconditions = resolve(operation, 'precondition', { many: true, type: Constraint })
    const raisedExceptions = resolve(operation, 'raisedException', { many: true, type: Type })
    const redefinedOperations = resolve(operation, 'redefinedOperation', { many: true, type: Operation })
    const templateParameter = resolve(operation, 'templateParameter', { type: OperationTemplateParameter })
    const returnResult = getReturnResult(ownedParameters)
    const type = returnResult ? resolve(returnResult, 'type', { type: Type, removeAttribute: false }) : undefined
    deriveAttribute_isOrdered(operation, returnResult)
    deriveAttribute_isUnique(operation, returnResult)
    deriveAttribute_lower(operation, returnResult)
    deriveAttribute_upper(operation, returnResult)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_bodyCondition(operation, bodyCondition)
    addEdge_class(operation)
    addEdge_datatype(operation)
    addEdge_interface(operation)
    addEdge_ownedParameter(operation, ownedParameters)
    addEdge_postcondition(operation, postconditions)
    addEdge_precondition(operation, preconditions)
    addEdge_raisedException(operation, raisedExceptions)
    addEdge_redefinedOperation(operation, redefinedOperations)
    addEdge_templateParameter(operation, templateParameter)
    addEdge_type(operation, type)
  },
  {
    [Uml.Attributes.isOrdered]: { type: 'boolean' },
    [Uml.Attributes.isQuery]: { type: 'boolean', defaultValue: 'false' },
    [Uml.Attributes.isUnique]: { type: 'boolean' },
    [Uml.Attributes.lower]: { type: 'integer' },
    [Uml.Attributes.upper]: { type: 'integer' },
  },
)

/**
 * Note: A large number of UML models from the TDD dataset contain unspecified "input" and "output" attributes.
 */
function removeInvalidInputOutputAttributes(operation: GraphNode) {
  operation.removeAttribute('input')
  operation.removeAttribute('output')
}

function getReturnResult(ownedParameters: GraphNode[]) {
  return ownedParameters.find((parameter) => parameter.getAttribute('direction')?.value.literal === 'return')
}

function deriveAttribute_isOrdered(operation: GraphNode, returnResult: GraphNode | undefined) {
  if (!returnResult) {
    return
  }
  const isOrdered = returnResult.getAttribute(Uml.Attributes.isOrdered)?.value.literal
  if (isOrdered === undefined) {
    return
  }
  operation.addAttribute({
    name: Uml.Attributes.isOrdered,
    type: 'boolean',
    value: { literal: isOrdered },
  })
}

function deriveAttribute_isUnique(operation: GraphNode, returnResult: GraphNode | undefined) {
  if (!returnResult) {
    return
  }
  const isUnique = returnResult.getAttribute(Uml.Attributes.isUnique)?.value.literal
  if (isUnique === undefined) {
    return
  }
  operation.addAttribute({
    name: Uml.Attributes.isUnique,
    type: 'boolean',
    value: { literal: isUnique },
  })
}

function deriveAttribute_lower(operation: GraphNode, returnResult: GraphNode | undefined) {
  if (!returnResult) {
    return
  }
  const lower = returnResult.getAttribute(Uml.Attributes.lower)?.value.literal
  if (lower === undefined) {
    return
  }
  operation.addAttribute({
    name: Uml.Attributes.lower,
    type: 'integer',
    value: { literal: lower },
  })
}

function deriveAttribute_upper(operation: GraphNode, returnResult: GraphNode | undefined) {
  if (!returnResult) {
    return
  }
  const upper = returnResult.getAttribute(Uml.Attributes.upper)?.value.literal
  if (upper === undefined) {
    return
  }
  operation.addAttribute({
    name: Uml.Attributes.upper,
    type: 'integer',
    value: { literal: upper },
  })
}

function addEdge_bodyCondition(operation: GraphNode, bodyCondition: GraphNode | undefined) {
  // ♦ bodyCondition : Constraint [0..1]{subsets Namespace::ownedRule} (opposite A_bodyCondition_bodyContext::bodyContext)
  // An optional Constraint on the result values of an invocation of this Operation.
  if (!bodyCondition) {
    return
  }
  operation.model.addEdge('bodyCondition', operation, bodyCondition)
}

function addEdge_class(_operation: GraphNode) {
  // class : Class [0..1]{subsets Feature::featuringClassifier, subsets NamedElement::namespace, subsets RedefinableElement::redefinitionContext} (opposite Class::ownedOperation)
  // The Class that owns this operation, if any.

  // Added by ClassHandler::addEdge_ownedOperations
}

function addEdge_datatype(_operation: GraphNode) {
  // datatype : DataType [0..1]{subsets Feature::featuringClassifier, subsets NamedElement::namespace, subsets RedefinableElement::redefinitionContext} (opposite DataType::ownedOperation)
  // The DataType that owns this Operation, if any.

  // Added by DataTypeHandler::addEdge_ownedOperation
}

function addEdge_interface(_operation: GraphNode) {
  // interface : Interface [0..1]{subsets Feature::featuringClassifier, subsets NamedElement::namespace, subsets RedefinableElement::redefinitionContext} (opposite Interface::ownedOperation)
  // The Interface that owns this Operation, if any.

  // Added by InterfaceHandler::addEdge_ownedOperation
}

function addEdge_ownedParameter(operation: GraphNode, ownedParameters: GraphNode[]) {
  // ♦ ownedParameter : Parameter [0..*]{ordered, redefines BehavioralFeature::ownedParameter} (opposite Parameter::operation)
  // The parameters owned by this Operation.
  ownedParameters.forEach((ownedParameter) => {
    operation.model.addEdge('ownedParameter', operation, ownedParameter)
  })
}

function addEdge_postcondition(operation: GraphNode, postconditions: GraphNode[]) {
  // ♦ postcondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_postcondition_postContext::postContext)
  // An optional set of Constraints specifying the state of the system when the Operation is completed.
  postconditions.forEach((postcondition) => {
    operation.model.addEdge('postcondition', operation, postcondition)
  })
}

function addEdge_precondition(operation: GraphNode, preconditions: GraphNode[]) {
  // ♦ precondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_precondition_preContext::preContext)
  // An optional set of Constraints on the state of the system when the Operation is invoked.
  preconditions.forEach((precondition) => {
    operation.model.addEdge('precondition', operation, precondition)
  })
}

function addEdge_raisedException(operation: GraphNode, raisedExceptions: GraphNode[]) {
  // raisedException : Type [0..*]{redefines BehavioralFeature::raisedException} (opposite A_raisedException_operation::operation)
  // The Types representing exceptions that may be raised during an invocation of this operation.
  raisedExceptions.forEach((raisedException) => {
    operation.model.addEdge('raisedException', operation, raisedException)
  })
}

function addEdge_redefinedOperation(operation: GraphNode, redefinedOperations: GraphNode[]) {
  // redefinedOperation : Operation [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedOperation_operation::operation)
  // The Operations that are redefined by this Operation.
  redefinedOperations.forEach((redefinedOperation) => {
    operation.model.addEdge('redefinedOperation', operation, redefinedOperation)
  })
}

function addEdge_templateParameter(operation: GraphNode, templateParameter: GraphNode | undefined) {
  // templateParameter : OperationTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite OperationTemplateParameter::parameteredElement)
  // The OperationTemplateParameter that exposes this element as a formal parameter.
  if (!templateParameter) {
    return
  }
  operation.model.addEdge('templateParameter', operation, templateParameter)
}

function addEdge_type(operation: GraphNode, type: GraphNode | undefined) {
  // /type : Type [0..1]{} (opposite A_type_operation::operation)
  // The return type of the operation, if present. This information is derived from the return result for this Operation.
  if (!type) {
    return
  }
  operation.model.addEdge('type', operation, type)
}
