import { Archimate } from '../archimate'
import { Documentation } from '../archimate-metamodel'

export const DocumentationHandler = Documentation.createHandler(
  (documentation) => {
    const textContent = documentation.getAttribute('text')?.value.literal
    if (textContent && documentation.parent !== undefined) {
      documentation.parent.addAttribute({ name: Archimate.Attributes.documentation, value: { literal: textContent } }, false)
    }
    documentation.model.removeNode(documentation)
  },
)
