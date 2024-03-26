import type { GraphNode } from '@cm2ml/ir'

import { resolve } from '../resolvers/resolve'
import { ElementImport, PackageImport, Profile } from '../uml-metamodel'

export const ProfileHandler = Profile.createHandler(
  (profile, { onlyContainmentAssociations }) => {
    const metaclassReferences = resolve(profile, 'metaclassReference', { many: true, type: ElementImport })
    const metamodelReferences = resolve(profile, 'metamodelReference', { many: true, type: PackageImport })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_metaclassReference(profile, metaclassReferences)
    addEdge_metamodelReference(profile, metamodelReferences)
  },
)

function addEdge_metaclassReference(profile: GraphNode, metaclassReferences: GraphNode[]) {
  // ♦ metaclassReference : ElementImport [0..*]{subsets Namespace::elementImport} (opposite A_metaclassReference_profile::profile)
  // References a metaclass that may be extended.
  metaclassReferences.forEach((metaclassReference) => {
    profile.model.addEdge('metaclassReference', profile, metaclassReference)
  })
}

function addEdge_metamodelReference(profile: GraphNode, metamodelReferences: GraphNode[]) {
  // ♦ metamodelReference : PackageImport [0..*]{subsets Namespace::packageImport} (opposite A_metamodelReference_profile::profile)
  // References a package containing (directly or indirectly) metaclasses that may be extended.
  metamodelReferences.forEach((metamodelReference) => {
    profile.model.addEdge('metamodelReference', profile, metamodelReference)
  })
}
