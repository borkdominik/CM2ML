import { Archimate } from '../archimate'
import { Documentation } from '../archimate-metamodel'

export const DocumentationHandler = Documentation.createHandler(
  (documentation) => {
    const textContent = documentation.getAttribute('text')?.value.literal
    if (textContent && documentation.parent !== undefined) {
      // TODO/Archimate: Define type
      documentation.parent.addAttribute({ name: Archimate.Attributes.documentation, type: 'unknown', value: { literal: textContent } }, false)
    }
    documentation.model.removeNode(documentation)
  },
)
