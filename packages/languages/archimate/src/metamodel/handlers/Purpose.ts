import { Archimate } from '../archimate'
import { Purpose } from '../archimate-metamodel'

export const PurposeHandler = Purpose.createHandler(
  (purpose) => {
    const textContent = purpose.getAttribute('text')?.value.literal
    if (textContent) {
      // TODO/Archimate: Define type
      purpose.model.root.addAttribute({ name: Archimate.Attributes.documentation, type: 'unknown', value: { literal: textContent } }, false)
    }
    purpose.model.removeNode(purpose)
  },
)
