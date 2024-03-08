import type { GraphNode } from '@cm2ml/ir'
import { getParentOfType } from '@cm2ml/metamodel'

import { resolve } from '../resolvers/resolve'
import { Uml, transformNodeToEdgeCallback } from '../uml'
import { Package, Profile, ProfileApplication } from '../uml-metamodel'

export const ProfileApplicationHandler = ProfileApplication.createHandler(
  (profileApplication, { onlyContainmentAssociations, relationshipsAsEdges }) => {
    const appliedProfile = resolve(profileApplication, 'appliedProfile', { type: Profile })
    const applyingPackage = resolve(profileApplication, 'applyingPackage', { type: Package }) ?? getParentOfType(profileApplication, Package)
    if (relationshipsAsEdges) {
      // TODO/Jan Validate edge direction
      return transformNodeToEdgeCallback(profileApplication, applyingPackage, appliedProfile)
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
  // appliedProfile : Profile [1..1]{subsets DirectedRelationship::target} (opposite A_appliedProfile_profileApplication::profileApplication)
  // References the Profiles that are applied to a Package through this ProfileApplication.
  if (!appliedProfile) {
    return
  }
  profileApplication.model.addEdge('appliedProfile', profileApplication, appliedProfile)
  profileApplication.model.addEdge('target', profileApplication, appliedProfile)
  profileApplication.model.addEdge('relatedElement', profileApplication, appliedProfile)
}

function addEdge_applyingPackage(profileApplication: GraphNode, applyingPackage: GraphNode | undefined) {
  // applyingPackage : Package [1..1]{subsets DirectedRelationship::source, subsets Element::owner} (opposite Package::profileApplication)
  // The package that owns the profile application.
  if (!applyingPackage) {
    return
  }
  profileApplication.model.addEdge('applyingPackage', profileApplication, applyingPackage)
  profileApplication.model.addEdge('source', profileApplication, applyingPackage)
  profileApplication.model.addEdge('relatedElement', profileApplication, applyingPackage)
}
