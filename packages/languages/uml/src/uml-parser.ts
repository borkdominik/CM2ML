import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { IrPostProcessor } from '@cm2ml/ir-post-processor'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'

import { Uml } from './metamodel/uml'
import { inferUmlHandler } from './metamodel/uml-handler-registry'
import { validateUmlModel } from './metamodel/uml-validations'

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

const UmlRefiner = definePlugin({
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
    removeUnsupportedElements(input)
    const model = refine(input, parameters)
    generateIds(model)
    removeNonUmlAttributes(model)
    validateUmlModel(model, parameters)
    return model
  },
})

function generateIds(model: GraphModel) {
  let id = 0
  model.nodes.forEach((node) => {
    if (node.id === undefined) {
      node.addAttribute({ name: Uml.Attributes['xmi:id'], value: { literal: `eu.yeger#generated-id-${id++}` } })
    }
  })
}

function removeUnsupportedElements(model: GraphModel) {
  // The following elements have been removed from the latest UML specification and are not supported by the UML metamodel
  const unsupportedTags = new Set(['eAnnotations', 'xmi:Documentation', 'xmi:Extension', 'XMI_20110701:Extension'])
  const unsupportedTypes = new Set(['ExecutionEvent', 'ReceiveOperationEvent', 'SendOperationEvent', 'VariablesDeclaration'])
  model.nodes.forEach((node) => {
    const nodeType = node.getAttribute(Uml.typeAttributeName)?.value.literal
    if (unsupportedTags.has(node.tag) || (nodeType && unsupportedTypes.has(nodeType))) {
      model.removeNode(node)
    }
  })
}

function removeNonUmlAttributes(model: GraphModel) {
  const attributesToRemove = new Set<string>(['href'])
  function shouldRemoveAttribute(name: string) {
    if (name.startsWith('xmlns:')) {
      return true
    }
    if (!(name in Uml.Attributes) && name.startsWith('xmi:')) {
      return true
    }
    if (attributesToRemove.has(name)) {
      return true
    }
    return false
  }
  ;[...model.nodes, ...model.edges].forEach((attributable) => {
    attributable.attributes.forEach(({ name }) => {
      if (shouldRemoveAttribute(name)) {
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
