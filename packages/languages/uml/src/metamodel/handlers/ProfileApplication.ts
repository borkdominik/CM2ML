import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { ProfileApplication } from '../uml-metamodel'

export const ProfileApplicationHandler = ProfileApplication.createHandler(
  (profileApplication, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_appliedProfile(profileApplication)
    addEdge_applyingPackage(profileApplication)
  },
  {
    [Uml.Attributes.isStrict]: 'true',
  },
)

function addEdge_appliedProfile(_profileApplication: GraphNode) {
  // TODO/Association
  // appliedProfile : Profile [1..1]{subsets DirectedRelationship::target} (opposite A_appliedProfile_profileApplication::profileApplication)
  // References the Profiles that are applied to a Package through this ProfileApplication.
}

function addEdge_applyingPackage(_profileApplication: GraphNode) {
  // TODO/Association
  // applyingPackage : Package [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Package::profileApplication)
  // The package that owns the profile application.
}
