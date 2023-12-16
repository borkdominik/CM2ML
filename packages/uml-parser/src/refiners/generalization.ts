import { Stream } from '@yeger/streams'

import { Uml, copyAttributes } from '../uml'

import { DirectedRelationship } from './directedRelationship'

export const Generalization = DirectedRelationship.extend(
  (node) => node.tag === Uml.Tags.generalization,
  (generalization) => {
    const specfic = generalization.parent
    if (!specfic) {
      throw new Error('Missing parent for generalization')
    }
    const generalChild = Stream.from(generalization.children).find(
      (child) => child.tag === Uml.Tags.general,
    )
    if (!generalChild) {
      throw new Error('Missing general child for generalization')
    }
    const generalId = generalChild.getAttribute('idref')?.value.literal
    if (!generalId) {
      throw new Error('Missing idref attribute on general')
    }
    const general = generalization.model.getNodeById(generalId)
    if (!general) {
      throw new Error(`Could not find general with id ${generalId}`)
    }
    const generalizationEdge = generalization.model.addEdge(
      'generalization',
      specfic,
      general,
    )
    copyAttributes(generalization, generalizationEdge)
    generalization.model.removeNode(generalization)
  },
)
