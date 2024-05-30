import { GraphModel, GraphNode } from "@cm2ml/ir"
import { Archimate } from "../metamodel/archimate"

// Archi Storage Format (typically ending in *.archimate)
// https://www.archimatetool.com/
export function isArchiFormat(input: GraphModel) {
    return (
        input.root.tag === 'archimate:model' &&
        input.root.getAttribute('xmlns:archimate')?.value.literal === 'http://www.archimatetool.com/archimate'
    )
}

export function restructureArchiXml(input: GraphModel) {
    // TODO: persist metadata
    input.nodes.forEach((node) => {
        if (node.tag === 'folder') {
            handleFolderNode(node, input)
        } else if (node.tag === 'archimate:model' || node.tag === 'element') {
            node.children.forEach((child) => {
                if (child.tag === 'documentation' || child.tag === 'purpose') {
                    console.log(child.tag)
                    const text = child.getAttribute('text')?.value.literal
                    if (text) {
                        node.addAttribute({ name: Archimate.Attributes.documentation, type: 'string', value: { literal: text } })
                    }
                    input.removeNode(child)
                }
            })
        }
    })
}
  
function handleFolderNode(node: GraphNode, input: GraphModel) {
    node.children.forEach((child) => {
        node.removeChild(child)
        input.root.addChild(child)
    })
    input.root.model.removeNode(node)
}