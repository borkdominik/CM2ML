import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { Uml } from '../uml'
import { Component, ComponentRealization, PackageableElement } from '../uml-metamodel'

export const ComponentHandler = Component.createHandler(
  (component, { onlyContainmentAssociations }) => {
    const packagedElements = resolve(component, 'packagedElement', { many: true, type: PackageableElement })
    const realizations = resolve(component, 'realization', { many: true, type: ComponentRealization })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_packagedElement(component, packagedElements)
    addEdge_provided(component)
    addEdge_realization(component, realizations)
    addEdge_required(component)
  },
  {
    [Uml.Attributes.isIndirectlyInstantiated]: { type: 'boolean', defaultValue: 'true' },
  },
)

function addEdge_packagedElement(component: GraphNode, packagedElements: GraphNode[]) {
  packagedElements.forEach((packagedElement) => {
    component.model.addEdge('packagedElement', component, packagedElement)
  })
}

function addEdge_provided(_component: GraphNode) {
  // TODO/Association
  // /provided : Interface [0..*]{} (opposite A_provided_component::component)
  // The Interfaces that the Component exposes to its environment.These Interfaces may be Realized by the Component or any of its realizingClassifiers, or they may be the Interfaces that are provided by its public Ports.
}

function addEdge_realization(component: GraphNode, realizations: GraphNode[]) {
  // ♦ realization: ComponentRealization[0..*]{subsets Element:: ownedElement, subsets A_supplier_supplierDependency:: supplierDependency } (opposite ComponentRealization::abstraction)
  // The set of Realizations owned by the Component.Realizations reference the Classifiers of which the Component is an abstraction; i.e., that realize its behavior.
  realizations.forEach((realization) => {
    component.model.addEdge('realization', component, realization)
  })
}

function addEdge_required(_component: GraphNode) {
  // TODO/Association
  // /required : Interface [0..*]{} (opposite A_required_component::component)
  // The Interfaces that the Component requires from other Components in its environment in order to be able to offer its full set of provided functionality. These Interfaces may be used by the Component or any of its realizingClassifiers, or they may be the Interfaces that are required by its public Ports.
}
