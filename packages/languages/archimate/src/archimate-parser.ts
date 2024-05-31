import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'

import { isArchiFormat, restructureArchiXml } from './formats/archi-format'
import { isOpenGroupFormat, restructureOpenGroupXml } from './formats/opengroup-format'
import { Archimate } from './metamodel/archimate'
import { inferArchimateHandler } from './metamodel/archimate-handler-registry'
import { validateArchimateModel } from './metamodel/archimate-validations'

const refine = createRefiner(Archimate, inferArchimateHandler)

export const ArchimateRefiner = definePlugin({
  name: 'archimate',
  parameters: {
    relationshipsAsNodes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Treat relationships as nodes',
    },
    viewsAsNodes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Include views and link their respective elements',
    },
  },
  invoke: (input: GraphModel, parameters) => {
    removeUnsupportedNodes(input, parameters.viewsAsNodes)
    preprocess(input)
    renameDeprecatedTypes(input)
    const model = refine(input, parameters)
    validateArchimateModel(model, parameters)
    return model
  },
})

function removeUnsupportedNodes(input: GraphModel, viewsAsNodes: boolean) {
  const tagsToRemove = new Set([
    'metadata', // TODO: persist metadata
    'bounds', 'style', // ignore style (i.e. colors) and bounds (i.e x,y coordinates) of diagram elements
    'property', 'propertyDefinitions', 'properties', // TODO: support custom properties?
    'profile', 'organizations', 'viewpoints' // unused tags
  ]);
  const xsiTypeToRemove = new Set(['SketchModel', 'CanvasModel']);

  input.nodes.forEach((node) => {
    const xsiType = node.getAttribute(Archimate.Attributes['xsi:type'])?.value.literal;
    if ((!viewsAsNodes && isViewElement(node)) || tagsToRemove.has(node.tag) || (xsiType && xsiTypeToRemove.has(xsiType))) {
      input.removeNode(node)
    }
  })
}

function preprocess(input: GraphModel) {
  if (isArchiFormat(input)) {
    restructureArchiXml(input)
  } else if (isOpenGroupFormat(input)) {
    restructureOpenGroupXml(input)
  } else {
    throw new Error('Unknown ArchiMate format!')
  }
}

function renameDeprecatedTypes(input: GraphModel) {
  input.nodes.forEach((node) => {
    const type = node.getAttribute(Archimate.Attributes['xsi:type'])?.value.literal
    switch (type) {
      case 'InfrastructureInterface':
      case 'InfrastructureFunction':
      case 'InfrastructureService':
        renameType(node, type.replace('Infrastructure', 'Technology'))
        break
      case 'CommunicationPath':
        renameType(node, Archimate.Types.Path)
        break
      case 'Network':
        renameType(node, Archimate.Types.CommunicationNetwork)
        break
      case 'RealisationRelationship':
        renameType(node, Archimate.Types.RealizationRelationship)
        break
      case 'SpecialisationRelationship':
        renameType(node, Archimate.Types.SpecializationRelationship)
        break
      case 'UsedByRelationship':
        renameType(node, Archimate.Types.ServingRelationship)
        break
      default:
        break
    }
  })
}

function renameType(node: GraphNode, newType: string) {
  node.removeAttribute(Archimate.Attributes['xsi:type'])
  node.addAttribute({ name: Archimate.Attributes['xsi:type'], type: 'string', value: { literal: newType } })
}

function isViewElement(node: GraphNode): boolean {
  // Views are stored within a <views> tag in opengroup format
  return (node.tag === 'views') ||
    // or as multiple <element> tags in archi format
    (node.tag === 'element' && node.getAttribute(Archimate.Attributes['xsi:type'])?.value.literal === Archimate.Types.ArchimateDiagramModel)
}

function handleTextNode(node: GraphNode, textContent: string) {
  const tag = node.tag
  if (!['purpose', 'documentation', 'name'].includes(tag)) {
    return
  }
  node.addAttribute({ name: 'text', type: 'string', value: { literal: textContent } })
}

export const ArchimateParser = compose(
  createXmiParser(Archimate.Attributes.id, handleTextNode),
  ArchimateRefiner,
  // compose(ArchimateRefiner, IrPostProcessor),
  'archimate',
)
