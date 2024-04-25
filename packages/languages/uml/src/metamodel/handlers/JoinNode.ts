import type { GraphNode } from '@cm2ml/ir'

import { Uml } from '../uml'
import { JoinNode } from '../uml-metamodel'

export const JoinNodeHandler = JoinNode.createHandler(
  (joinNode, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_joinSpec(joinNode)
  },
  {
    [Uml.Attributes.isCombineDuplicate]: { type: 'boolean', defaultValue: 'true' },
  },
)

function addEdge_joinSpec(_joinNode: GraphNode) {
  // TODO/Association
  // ♦ joinSpec : ValueSpecification [0..1]{subsets Element::ownedElement} (opposite A_joinSpec_joinNode::joinNode)
  // A ValueSpecification giving the condition under which the JoinNode will offer a token on its outgoing ActivityEdge. If no joinSpec is specified, then the JoinNode will offer an outgoing token if tokens are offered on all of its incoming ActivityEdges (an "and" condition).
}
