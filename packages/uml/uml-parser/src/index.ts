import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { IrPostProcessor } from '@cm2ml/ir-post-processor'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { Uml, inferUmlHandler, validateUmlModel } from '@cm2ml/uml-metamodel'
import { createXmiParser } from '@cm2ml/xmi-parser'

const refine = createRefiner(Uml, inferUmlHandler)

// TODO: Transform the following Relationships into edges if relationshipsAsEdges is true
// - Abstraction
// - InformationFlow
// - Manifestation
// - Realization
// - Refine
// - TemplateBinding
// - Trace
// - Usage

// These are based on Papyrus UML
// The following Relationships are already being transformed
// - Dependency
// - ElementImport
// - PackageImport
// - PackageMerge

export const UmlRefiner = definePlugin({
  name: 'uml',
  parameters: {
    onlyContainmentAssociations: {
      type: 'boolean',
      defaultValue: false,
      description: 'Only consider containment associations for edges.',
    },
    relationshipsAsEdges: {
      type: 'boolean',
      defaultValue: true,
      description: 'Treat relationships as edges.',
    },
  },
  invoke: (input: GraphModel, parameters) => {
    input.nodes.forEach((node) => {
      if (node.tag === 'eAnnotations') {
        input.removeNode(node)
      }
    })
    const model = refine(input, parameters)

    removeNonUmlAttributes(model)
    validateUmlModel(model, parameters)
    return model
  },
})

function removeNonUmlAttributes(model: GraphModel) {
  ;[...model.nodes, ...model.edges].forEach((attributable) => {
    attributable.attributes.forEach(({ name }) => {
      if (name.startsWith('xmlns:')) {
        attributable.removeAttribute(name)
        return
      }
      if (!(name in Uml.Attributes) && name.startsWith('xmi:')) {
        attributable.removeAttribute(name)
      }
    })
  })
}

function handleTextNode(node: GraphNode, text: string) {
  const tag = node.tag
  if (!['body', 'language'].includes(tag)) {
    return
  }
  if (node.getAttribute(tag) !== undefined) {
    return
  }
  node.addAttribute({ name: tag, value: { literal: text } })
}

export const UmlParser = compose(
  createXmiParser(Uml.Attributes['xmi:id'], handleTextNode),
  compose(UmlRefiner, IrPostProcessor),
  'uml',
)
