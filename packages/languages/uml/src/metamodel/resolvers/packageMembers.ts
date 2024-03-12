import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Namespace } from '../uml-metamodel'

/**
 * Resolves package members for the given model.
 * Note, ensure that fallback IDs are generated before calling this function.
 *
 * @param model - The model whose package members should be resolved
 */
export function resolvePackageMembers(model: GraphModel, relationshipsAsEdges: boolean) {
  // TODO/Jan: Also handle package merges?
  if (relationshipsAsEdges) {
    resolvePackageMembersFromPackageImportEdges(model)
    return
  }
  resolvePackageMembersFromPackageImportNodes(model)
}

function resolvePackageMembersFromPackageImportEdges(model: GraphModel) {
  const namespacesWithPackageImports = Stream.from(model.nodes)
    .filter((node) => Namespace.isAssignable(node))
    .map((namespace) => {
      const importedPackages = Stream.from(namespace.outgoingEdges)
        .filter((incomingEdge) => incomingEdge.tag === 'packageImport')
        .map((incomingEdge) => incomingEdge.target)
        .distinct()
        .toArray()
      if (importedPackages.length === 0) {
        return undefined
      }
      return [namespace, importedPackages] as const
    })
    .filterNonNull()
    .toArray()

  model.debug('Parser', `Resolving package members for ${namespacesWithPackageImports.length} namespace(s)`)
  let newMembersResolved = true
  let iterations = 0
  const existingMemberAssociations = Stream.from(namespacesWithPackageImports).toRecord(([namespace]) => namespace.id!, ([namespace]) => getMembersOfNamespace(namespace).toSet())
  while (newMembersResolved) {
    model.debug('Parser', `Resolving package members, iteration ${iterations++}`)
    newMembersResolved = false
    namespacesWithPackageImports.forEach(([namespace, importedPackages]) => {
      model.debug('Parser', `Resolving package members for ${namespace.id} from ${importedPackages.length} imported packages`)
      Stream.from(importedPackages)
        .flatMap(getMembersOfNamespace)
        .forEach((importedMember) => {
          const existingMembers = existingMemberAssociations[namespace.id!]!
          if (existingMembers.has(importedMember)) {
            return
          }
          existingMembers.add(importedMember)
          newMembersResolved = true
          model.addEdge('importedMember', namespace, importedMember)
          model.addEdge('member', namespace, importedMember)
        })
    })
  }
}

function resolvePackageMembersFromPackageImportNodes(model: GraphModel) {
  const namespacesWithPackageImports = Stream.from(model.nodes)
    .filter((node) => Namespace.isAssignable(node))
    .map((namespace) => {
      const importedPackages = Stream.from(namespace.incomingEdges)
        .filter((incomingEdge) => incomingEdge.tag === 'importingNamespace')
        .map((incomingEdge) => incomingEdge.source)
        .map((packageImport) => Stream.from(packageImport.outgoingEdges).find((outgoingEdge) => outgoingEdge.tag === 'importedPackage')?.target)
        .filterNonNull()
        .distinct()
        .toArray()
      if (importedPackages.length === 0) {
        return undefined
      }
      return [namespace, importedPackages] as const
    })
    .filterNonNull()
    .toArray()

  model.debug('Parser', `Resolving package members for ${namespacesWithPackageImports.length} namespace(s)`)
  let newMembersResolved = true
  let iterations = 0
  const existingMemberAssociations = Stream.from(namespacesWithPackageImports).toRecord(([namespace]) => namespace.id!, ([namespace]) => getMembersOfNamespace(namespace).toSet())
  while (newMembersResolved) {
    model.debug('Parser', `Resolving package members, iteration ${iterations++}`)
    newMembersResolved = false
    namespacesWithPackageImports.forEach(([namespace, importedPackages]) => {
      model.debug('Parser', `Resolving package members for ${namespace.id} from ${importedPackages.length} imported packages`)
      Stream.from(importedPackages)
        .flatMap(getMembersOfNamespace)
        .forEach((importedMember) => {
          const existingMembers = existingMemberAssociations[namespace.id!]!
          if (existingMembers.has(importedMember)) {
            return
          }
          existingMembers.add(importedMember)
          newMembersResolved = true
          model.addEdge('importedMember', namespace, importedMember)
          model.addEdge('member', namespace, importedMember)
        })
    })
  }
}

function getMembersOfNamespace(namespace: GraphNode): Stream<GraphNode> {
  if (!Namespace.isAssignable(namespace)) {
    return Stream.empty()
  }
  return Stream.from(namespace.outgoingEdges)
    .filter((edge) => edge.tag === 'member')
    .map((edge) => edge.target)
}
