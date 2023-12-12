import { Stream } from '@yeger/streams'

import { Uml } from '../uml'

import { DirectedRelationship } from './relationship'

export const Generalization = DirectedRelationship.extend(
  (node) => node.tag === Uml.Tags.generalization,
  (node) => {
    const specfic = node.parent
    if (!specfic) {
      throw new Error('Missing parent for generalization')
    }
    const generalChild = Stream.from(node.children).find(
      (child) => child.tag === Uml.Tags.general,
    )
    if (!generalChild) {
      throw new Error('Missing general child for generalization')
    }
    const generalId = generalChild.getAttribute('idref')?.value.literal
    if (!generalId) {
      throw new Error('Missing idref attribute on general')
    }
    const general = node.model.getNodeById(generalId)
    if (!general) {
      throw new Error(`Could not find general with id ${generalId}`)
    }
    node.model.addEdge('generalization', specfic, general)
    node.model.removeNode(node)
  },
)
