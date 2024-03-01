import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Classifier, Interface, Operation, Property, ProtocolStateMachine, Reception } from '../uml-metamodel'

export const InterfaceHandler = Interface.createHandler(
  (interface_, { onlyContainmentAssociations }) => {
    const ownedAttributes = resolve(interface_, 'ownedAttribute', { many: true, type: Property })
    const ownedOperations = resolve(interface_, 'ownedOperation', { many: true, type: Operation })
    const ownedReceptions = resolve(interface_, 'ownedReception', { many: true, type: Reception })
    const protocol = resolve(interface_, 'protocol', { type: ProtocolStateMachine })
    if (onlyContainmentAssociations) {
      return
    }

    interface_.children.forEach((child) => {
      addEdge_nestedClassifier(interface_, child)
    })
    addEdge_ownedAttribute(interface_, ownedAttributes)
    addEdge_ownedOperation(interface_, ownedOperations)
    addEdge_ownedReception(interface_, ownedReceptions)
    addEdge_protocol(interface_, protocol)
    addEdge_redefinedInterface(interface_)
  },
)

function addEdge_nestedClassifier(interface_: GraphNode, child: GraphNode) {
  // ♦ nestedClassifier : Classifier [0..*]{ordered, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite A_nestedClassifier_interface::interface)
  // References all the Classifiers that are defined (nested) within the Interface.
  if (Classifier.isAssignable(child)) {
    interface_.model.addEdge('nestedClassifier', interface_, child)
  }
}

function addEdge_ownedAttribute(interface_: GraphNode, ownedAttributes: GraphNode[]) {
  // ♦ ownedAttribute : Property [0..*]{ordered, subsets Classifier::attribute, subsets Namespace::ownedMember} (opposite Property::interface)
  // The attributes (i.e., the Properties) owned by the Interface.
  ownedAttributes.forEach((ownedAttribute) => {
    interface_.model.addEdge('ownedAttribute', interface_, ownedAttribute)
  })
}

function addEdge_ownedOperation(interface_: GraphNode, ownedOperations: GraphNode[]) {
  // ♦ ownedOperation : Operation [0..*]{ordered, subsets Classifier::feature, subsets A_redefinitionContext_redefinableElement::redefinableElement, subsets Namespace::ownedMember} (opposite Operation::interface)
  // The Operations owned by the Interface.
  ownedOperations.forEach((ownedOperation) => {
    interface_.model.addEdge('ownedOperation', interface_, ownedOperation)
    ownedOperation.model.addEdge('interface', ownedOperation, interface_)
  })
}

function addEdge_ownedReception(interface_: GraphNode, ownedReceptions: GraphNode[]) {
  // ♦ ownedReception : Reception [0..*]{subsets Classifier::feature, subsets Namespace::ownedMember} (opposite A_ownedReception_interface::interface)
  // Receptions that objects providing this Interface are willing to accept.
  ownedReceptions.forEach((ownedReception) => {
    interface_.model.addEdge('ownedReception', interface_, ownedReception)
  })
}

function addEdge_protocol(interface_: GraphNode, protocol: GraphNode | undefined) {
  // ♦ protocol : ProtocolStateMachine [0..1]{subsets Namespace::ownedMember} (opposite A_protocol_interface::interface)
  // References a ProtocolStateMachine specifying the legal sequences of the invocation of the BehavioralFeatures described in the Interface.
  if (!protocol) {
    return
  }
  interface_.model.addEdge('protocol', interface_, protocol)
}

function addEdge_redefinedInterface(_interface_: GraphNode) {
  // TODO/Association
  // redefinedInterface : Interface [0..*]{subsets Classifier::redefinedClassifier} (opposite A_redefinedInterface_interface::interface )
  // References all the Interfaces redefined by this Interface.
}
