import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Classifier, Interface, Operation, Property, Reception } from '../uml-metamodel'

export const InterfaceHandler = Interface.createHandler(
  (interface_, { onlyContainmentAssociations }) => {
    const ownedReceptions = resolve(interface_, 'ownedReception', { many: true, type: Reception })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_protocol(interface_)
    addEdge_redefinedInterface(interface_)
    interface_.children.forEach((child) => {
      // TODO/Jan: Refactor to use resolve
      addEdge_nestedClassifier(interface_, child)
      addEdge_ownedAttribute(interface_, child)
      addEdge_ownedOperation(interface_, child)
    })
    addEdge_ownedReception(interface_, ownedReceptions)
  },
)

function addEdge_nestedClassifier(interface_: GraphNode, child: GraphNode) {
  if (Classifier.isAssignable(child)) {
    interface_.model.addEdge('nestedClassifier', interface_, child)
  }
}

function addEdge_ownedAttribute(interface_: GraphNode, child: GraphNode) {
  if (Property.isAssignable(child)) {
    interface_.model.addEdge('ownedAttribute', interface_, child)
  }
}

function addEdge_ownedOperation(interface_: GraphNode, child: GraphNode) {
  if (Operation.isAssignable(child)) {
    interface_.model.addEdge('ownedOperation', interface_, child)
  }
}

function addEdge_ownedReception(interface_: GraphNode, ownedReceptions: GraphNode[]) {
  // ♦ ownedReception : Reception [0..*]{subsets Classifier::feature, subsets Namespace::ownedMember} (opposite A_ownedReception_interface::interface)
  // Receptions that objects providing this Interface are willing to accept.
  ownedReceptions.forEach((ownedReception) => {
    interface_.model.addEdge('ownedReception', interface_, ownedReception)
  })
}

function addEdge_protocol(_interface_: GraphNode) {
  // TODO/Association
  // ♦ protocol : ProtocolStateMachine [0..1]{subsets Namespace::ownedMember} (opposite A_protocol_interface::interface)
  // References a ProtocolStateMachine specifying the legal sequences of the invocation of the BehavioralFeatures described in the Interface.
}

function addEdge_redefinedInterface(_interface_: GraphNode) {
  // TODO/Association
  // redefinedInterface : Interface [0..*]{subsets Classifier::redefinedClassifier} (opposite A_redefinedInterface_interface::interface )
  // References all the Interfaces redefined by this Interface.
}
