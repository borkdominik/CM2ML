import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType, transformNodeToEdge } from '@cm2ml/metamodel'

import { Uml } from '../uml'
import { Package, Profile, ProfileApplication } from '../uml-metamodel'

export const ProfileApplicationHandler = ProfileApplication.createHandler(
  (profileApplication, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const appliedProfile = profileApplication.findChild(Profile.isAssignable)
    const applyingPackage = getParentOfType(profileApplication, Package)
    if (relationshipsAsEdges) {
      // TODO/Jan Validate edge direction
      transformNodeToEdge(profileApplication, applyingPackage, appliedProfile, 'appliedProfile')
      return
    }
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_appliedProfile(profileApplication, appliedProfile)
    addEdge_applyingPackage(profileApplication, applyingPackage)
  },
  {
    [Uml.Attributes.isStrict]: 'true',
  },
)

function addEdge_appliedProfile(profileApplication: GraphNode, appliedProfile: GraphNode | undefined) {
  // TODO/Association
  // appliedProfile : Profile [1..1]{subsets DirectedRelationship::target} (opposite A_appliedProfile_profileApplication::profileApplication)
  // References the Profiles that are applied to a Package through this ProfileApplication.
  if (!appliedProfile) {
    return
  }
  profileApplication.model.addEdge('appliedProfile', profileApplication, appliedProfile)
}

function addEdge_applyingPackage(profileApplication: GraphNode, applyingPackage: GraphNode | undefined) {
  // TODO/Association
  // applyingPackage : Package [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Package::profileApplication)
  // The package that owns the profile application.
  if (!applyingPackage) {
    return
  }
  profileApplication.model.addEdge('applyingPackage', profileApplication, applyingPackage)
}
