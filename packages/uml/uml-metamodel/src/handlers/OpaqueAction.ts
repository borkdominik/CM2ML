import type { GraphNode } from '@cm2ml/ir'

import { OpaqueAction } from '../uml-metamodel'

export const OpaqueActionHandler = OpaqueAction.createHandler(
  (opaqueAction, { onlyContainmentAssociations }) => {
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_inputValue(opaqueAction)
    addEdge_outputValue(opaqueAction)
  },
)
function addEdge_inputValue(_opaqueAction: GraphNode) {
  // TODO/Association
  // ♦ inputValue : InputPin [0..*]{subsets Action::input} (opposite A_inputValue_opaqueAction::opaqueAction)
  // The InputPins providing inputs to the OpaqueAction.
}

function addEdge_outputValue(_opaqueAction: GraphNode) {
  // TODO/Association
  // ♦ outputValue : OutputPin [0..*]{subsets Action::output} (opposite A_outputValue_opaqueAction::opaqueAction)
  // The OutputPins on which the OpaqueAction provides outputs.
}
