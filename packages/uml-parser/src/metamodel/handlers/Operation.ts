import type { GraphNode } from '@cm2ml/ir'

import { Class, DataType, Interface, Operation, Parameter } from '../metamodel'

// TODO
export const OperationHandler = Operation.createHandler((node) => {
  addEdge_bodyCondition(node)
  addEdge_class(node)
  addEdge_datatype(node)
  addEdge_interface(node)
  node.children.forEach((child) => {
    addEdge_ownedParameter(node, child)
  })
  addEdge_postcondition(node)
  addEdge_precondition(node)
  addEdge_raisedException(node)
  addEdge_redefinedOperation(node)
  addEdge_templateParameter(node)
  addEdge_type(node)
})

function addEdge_bodyCondition(_operation: GraphNode) {
  // TODO
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
  // TODO
  // ♦ postcondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_postcondition_postContext::postContext)
  // An optional set of Constraints specifying the state of the system when the Operation is completed.
}

function addEdge_precondition(_operation: GraphNode) {
  // TODO
  // ♦ precondition : Constraint [0..*]{subsets Namespace::ownedRule} (opposite A_precondition_preContext::preContext)
  // An optional set of Constraints on the state of the system when the Operation is invoked.
}

function addEdge_raisedException(_operation: GraphNode) {
  // TODO
  // raisedException : Type [0..*]{redefines BehavioralFeature::raisedException} (opposite A_raisedException_operation::operation)
  // The Types representing exceptions that may be raised during an invocation of this operation.
}

function addEdge_redefinedOperation(_operation: GraphNode) {
  // TODO
  // redefinedOperation : Operation [0..*]{subsets RedefinableElement::redefinedElement} (opposite A_redefinedOperation_operation::operation)
  // The Operations that are redefined by this Operation.
}

function addEdge_templateParameter(_operation: GraphNode) {
  // TODO
  // templateParameter : OperationTemplateParameter [0..1]{redefines ParameterableElement::templateParameter} (opposite OperationTemplateParameter::parameteredElement)
  // The OperationTemplateParameter that exposes this element as a formal parameter.
}

function addEdge_type(_operation: GraphNode) {
  // TODO
  // /type : Type [0..1]{} (opposite A_type_operation::operation)
  // The return type of the operation, if present. This information is derived from the return result for this Operation.
}
