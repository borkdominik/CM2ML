import { ArchimateDiagramModel } from '../archimate-metamodel'

export const ArchimateDiagramModelHandler = ArchimateDiagramModel.createHandler((diagram) => {
  diagram.children.forEach((object) => {
    const elementId = object.getAttribute('archimateElement')?.value.literal
    if (elementId) {
      const node = diagram.model.getNodeById(elementId)
      if (node && diagram.id) {
        node.addAttribute({ name: 'view', type: 'string', value: { literal: diagram.id } }, false)
        diagram.model.addEdge('contains', diagram, node)
      }
    }
    object.children.forEach((object_child) => {
      object.model.removeNode(object_child)
    })
    object.model.removeNode(object)
  })
})
