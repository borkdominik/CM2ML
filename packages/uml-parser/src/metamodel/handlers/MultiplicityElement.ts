import { Uml } from '../../uml'
import { MultiplicityElement } from '../metamodel'

export const MultiplicityElementHandler = MultiplicityElement.createHandler(
  (node) => {
    node.children.forEach((child) => {
      if (child.tag === Uml.Tags.lowerValue) {
        node.model.addEdge('lowerValue', node, child)
        const lowerValue = child.getAttribute('value')?.value.literal
        if (lowerValue === undefined) {
          throw new Error('LowerValue must have a value')
        }
        node.addAttribute({ name: 'lower', value: { literal: lowerValue } })
      } else if (child.tag === Uml.Tags.upperValue) {
        node.model.addEdge('upperValue', node, child)
        const upperValue = child.getAttribute('value')?.value.literal
        if (upperValue === undefined) {
          throw new Error('UpperValue must have a value')
        }
        node.addAttribute({ name: 'upper', value: { literal: upperValue } })
      }
    })
  },
)
