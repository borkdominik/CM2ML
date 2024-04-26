import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import { Uml } from '../uml'
import { Classifier } from '../uml-metamodel'

export function resolveInheritedMembers(model: GraphModel) {
  const classifiersWithGeneralClassifiers = Stream.from(model.nodes)
    .filter((node) => Classifier.isAssignable(node))
    .map((classifier) => {
      const generalClassifiers = getGeneralClassifiers(classifier)
      if (generalClassifiers.length === 0) {
        return undefined
      }
      return [classifier, generalClassifiers] as const
    })
    .filterNonNull()
    .toArray()

  model.debug('Parser', `Resolving inherited members for ${classifiersWithGeneralClassifiers.length} classifiers(s)`)
  let newMembersResolved = true
  let iterations = 0
  const existingMemberAssociations = Stream.from(classifiersWithGeneralClassifiers).toRecord(([classifier]) => classifier.id!, ([classifier]) => getMembersOfClassifier(classifier).toSet())
  while (newMembersResolved) {
    model.debug('Parser', `Resolving inherited members, iteration ${iterations++}`)
    newMembersResolved = false
    classifiersWithGeneralClassifiers.forEach(([classifier, generalClassifiers]) => {
      model.debug('Parser', `Resolving inherited members for ${classifier.id} from ${generalClassifiers.length} general classifier(s)`)
      Stream.from(generalClassifiers)
        .flatMap(getInheritableMembersOfClassifier)
        .forEach((inheritedMember) => {
          const existingMembers = existingMemberAssociations[classifier.id!]!
          if (existingMembers.has(inheritedMember)) {
            return
          }
          existingMembers.add(inheritedMember)
          newMembersResolved = true
          classifier.model.addEdge('inheritedMember', classifier, inheritedMember)
          classifier.model.addEdge('member', classifier, inheritedMember)
        })
    })
  }
}

function getGeneralClassifiers(classifier: GraphNode) {
  return Stream.from(classifier.outgoingEdges)
    .filter((edge) => edge.tag === 'general')
    .map((edge) => edge.target)
    .toArray()
}

function getMembersOfClassifier(classifier: GraphNode): Stream<GraphNode> {
  if (!Classifier.isAssignable(classifier)) {
    return Stream.empty()
  }
  return Stream.from(classifier.outgoingEdges)
    .filter((edge) => edge.tag === 'member')
    .map((edge) => edge.target)
}

function getInheritableMembersOfClassifier(generalClassifier: GraphNode): Stream<GraphNode> {
  return getMembersOfClassifier(generalClassifier)
    .filter((member) => {
      const memberVisibility = member.getAttribute(Uml.Attributes.visibility)?.value.literal
      return memberVisibility !== 'private'
    })
}
