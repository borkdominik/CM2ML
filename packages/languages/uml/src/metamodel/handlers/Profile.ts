import type { GraphNode } from '@cm2ml/ir'

import { resolveFromAttribute } from '../resolvers/fromAttribute'
import { Profile } from '../uml-metamodel'

export const ProfileHandler = Profile.createHandler(
  (profile, { onlyContainmentAssociations }) => {
    const metamodelReference = resolveFromAttribute(profile, 'metamodelReference')
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_metaclassReference(profile)
    addEdge_metamodelReference(profile, metamodelReference)
  },
)

function addEdge_metaclassReference(_profile: GraphNode) {
  // TODO/Association
  // ♦ metaclassReference : ElementImport [0..*]{subsets Namespace::elementImport} (opposite A_metaclassReference_profile::profile)
  // References a metaclass that may be extended.
}

function addEdge_metamodelReference(profile: GraphNode, metamodelReference: GraphNode | undefined) {
  // TODO/Association
  // ♦ metamodelReference : PackageImport [0..*]{subsets Namespace::packageImport} (opposite A_metamodelReference_profile::profile)
  // References a package containing (directly or indirectly) metaclasses that may be extended.
  if (!metamodelReference) {
    return
  }
  profile.model.addEdge('metamodelReference', profile, metamodelReference)
}
