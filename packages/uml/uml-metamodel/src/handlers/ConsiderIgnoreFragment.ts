import type { GraphNode } from '@cm2ml/ir'

import { ConsiderIgnoreFragment } from '../uml-metamodel'

export const ConsiderIgnoreFragmentHandler =
  ConsiderIgnoreFragment.createHandler(
    (considerIgnoreFragment, { onlyContainmentAssociations }) => {
      if (onlyContainmentAssociations) {
        return
      }
      addEdge_message(considerIgnoreFragment)
    },
  )

function addEdge_message(_considerIgnoreFragment: GraphNode) {
  // TODO/Association
  // message : NamedElement [0..*] (opposite A_message_considerIgnoreFragment::considerIgnoreFragment)
  // The set of messages that apply to this fragment.
}
