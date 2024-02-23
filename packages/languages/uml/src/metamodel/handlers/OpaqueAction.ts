import type { GraphNode } from '@cm2ml/ir'

import { setBodyAttribute } from '../resolvers/body'
import { setLanguageAttribute } from '../resolvers/language'
import { resolveFromChild } from '../resolvers/resolve'
import { InputPin, OpaqueAction, OutputPin } from '../uml-metamodel'

export const OpaqueActionHandler = OpaqueAction.createHandler(
  (opaqueAction, { onlyContainmentAssociations }) => {
    setBodyAttribute(opaqueAction)
    setLanguageAttribute(opaqueAction)
    const inputValues = resolveFromChild(opaqueAction, 'inputValue', { many: true, type: InputPin })
    const outputValues = resolveFromChild(opaqueAction, 'outputValue', { many: true, type: OutputPin })
    if (onlyContainmentAssociations) {
      return
    }
    addEdge_inputValue(opaqueAction, inputValues)
    addEdge_outputValue(opaqueAction, outputValues)
  },
)
function addEdge_inputValue(opaqueAction: GraphNode, inputValues: GraphNode[]) {
  // ♦ inputValue : InputPin [0..*]{subsets Action::input} (opposite A_inputValue_opaqueAction::opaqueAction)
  // The InputPins providing inputs to the OpaqueAction.
  inputValues.forEach((inputValue) => {
    opaqueAction.model.addEdge('inputValue', opaqueAction, inputValue)
  })
}

function addEdge_outputValue(opaqueAction: GraphNode, outputValues: GraphNode[]) {
  // ♦ outputValue : OutputPin [0..*]{subsets Action::output} (opposite A_outputValue_opaqueAction::opaqueAction)
  // The OutputPins on which the OpaqueAction provides outputs.
  outputValues.forEach((outputValue) => {
    opaqueAction.model.addEdge('outputValue', opaqueAction, outputValue)
  })
}
