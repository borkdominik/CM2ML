import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import {
  Class,
  DataType,
  Interface,
  Operation,
  Parameter,
} from '../uml-metamodel'

export const OperationHandler = Operation.createHandler(
  (operation, { onlyContainmentAssociations }) => {
    const redefinedOperations = getRedefinedOperations(operation)
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_bodyCondition(operation)
    addEdge_class(operation)
    addEdge_datatype(operation)
    addEdge_interface(operation)
    operation.children.forEach((child) => {
      addEdge_ownedParameter(operation, child)
    })
    addEdge_postcondition(operation)
    addEdge_precondition(operation)
    addEdge_raisedException(operation)
    addEdge_redefinedOperation(operation, redefinedOperations)
    addEdge_templateParameter(operation)
    addEdge_type(operation)
  },
  {
    [Uml.Attributes.isQuery]: 'false',
  },
)

function getRedefinedOperations(operation: GraphNode) {
  const redefinedOperations = operation.findAllChildren((child) => child.tag === 'redefinedOperation')
  redefinedOperations.forEach((redefinedOperation) => {
    // TODO/Jan: Only as fallback
    redefinedOperation.addAttribute({ name: Uml.typeAttributeName, value: { literal: Uml.Types.Operation } })
  })
  return redefinedOperations
}

function addEdge_bodyCondition(_operation: GraphNode) {
  // TODO/Association
  // ♦ bodyCondition : Constraint [0..1]{subsets Namespace::ownedRule} (opposite A_bodyCondition_bodyContext::bodyContext)
  // An optional Constraint on the result values of an invocation of this Operation.
}

function addEdge_class(operation: GraphNode) {
  const parent = operation.parent
  if (parent && Class.isAssignable(parent)) {
    operation.model.addEdge('class', operation, parent)
  }
}

function addEdge_datatype(operation: GraphNode) {
  const parent = operation.parent
  if (parent && DataType.isAssignable(parent)) {
    operation.model.addEdge('datatype', operation, parent)
  }
}

function addEdge_interface(operation: GraphNode) {
  const parent = operation.parent
  if (parent && Interface.isAssignable(parent)) {
    operation.model.addEdge('interface', operation, parent)
  }
}

function addEdge_ownedParameter(operation: GraphNode, child: GraphNode) {
  if (Parameter.isAssignable(child)) {
    operation.model.addEdge('ownedParameter', operation, child)
  }
}

function addEdge_postcondition(_operation: GraphNode) {
  // TODO/Association
  // ♦ postcondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_postcondition_postContext::postContext)
  // An optional set of Constraints specifying the state of the system when the Operation is completed.
}

function addEdge_precondition(_operation: GraphNode) {
  // TODO/Association
  // ♦ precondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_precondition_preContext::preContext)
  // An optional set of Constraints on the state of the system when the Operation is invoked.
}

function addEdge_raisedException(_operation: GraphNode) {
  // TODO/Association
  // raisedException : Type [0..*]{redefines BehavioralFeature::raisedException} (opposite A_raisedException_operation::operation)
  // The Types representing exceptions that may be raised during an invocation of this operation.
}

function addEdge_redefinedOperation(operation: GraphNode, redefinedOperations: GraphNode[]) {
  // TODO/Association
  // redefinedOperation : Operation [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedOperation_operation::operation)
  // The Operations that are redefined by this Operation.
  redefinedOperations.forEach((redefinedOperation) => {
    operation.model.addEdge('redefinedOperation', operation, redefinedOperation)
  })
}

function addEdge_templateParameter(_operation: GraphNode) {
  // TODO/Association
  // templateParameter : OperationTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite OperationTemplateParameter::parameteredElement)
  // The OperationTemplateParameter that exposes this element as a formal parameter.
}

function addEdge_type(_operation: GraphNode) {
  // TODO/Association
  // /type : Type [0..1]{} (opposite A_type_operation::operation)
  // The return type of the operation, if present. This information is derived from the return result for this Operation.
}
