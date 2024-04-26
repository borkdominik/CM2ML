import type { GraphModel } from '@cm2ml/ir'
import { GraphNode } from '@cm2ml/ir'
import { IrPostProcessor } from '@cm2ml/ir-post-processor'
import { createRefiner } from '@cm2ml/metamodel-refiner'
import { compose, definePlugin } from '@cm2ml/plugin'
import { createXmiParser } from '@cm2ml/xmi-parser'

import { resolveDeployedElements } from './metamodel/resolvers/deployedElements'
import { resolveImportedMembers } from './metamodel/resolvers/importedMembers'
import { resolveInheritedMembers } from './metamodel/resolvers/inheritedMember'
import { Uml } from './metamodel/uml'
import { inferUmlHandler } from './metamodel/uml-handler-registry'
import { validateUmlModel } from './metamodel/uml-validations'

const refine = createRefiner(Uml, inferUmlHandler)

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
      defaultValue: false,
      description: 'Treat relationships as edges.',
    },
    whitelist: {
      type: 'array<string>',
      defaultValue: Object.keys(Uml.Types),
      description: 'Whitelist of UML element types to include in the model.',
      allowedValues: Object.keys(Uml.Types),
    },
    blacklist: {
      type: 'array<string>',
      defaultValue: [],
      description: 'Blacklist of UML element types to exclude from the model. Has precedence over the whitelist.',
      allowedValues: Object.keys(Uml.Types),
    },
  },
  invoke: (input: GraphModel, parameters) => {
    removeUnsupportedNodes(input)
    generateIds(input)
    const model = refine(input, parameters)
    if (!parameters.onlyContainmentAssociations) {
      resolveInheritedMembers(model)
      resolveImportedMembers(model, parameters.relationshipsAsEdges)
      resolveDeployedElements(model, parameters.relationshipsAsEdges)
    }
    pruneNodes(model, parameters.whitelist, parameters.blacklist)
    persistMetadata(model)
    removeNonUmlAttributes(model)
    validateUmlModel(model, parameters)
    return model
  },
})

function generateIds(model: GraphModel) {
  let id = 0
  model.nodes.forEach((node) => {
    if (!node.id) {
      node.addAttribute({ name: Uml.Attributes['xmi:id'], type: 'string', value: { literal: `eu.yeger#generated-id-${id++}` } }, false)
    }
  })
  if (id > 0) {
    model.debug('Parser', `Generated ${id} ids`)
  }
}

function removeUnsupportedNodes(model: GraphModel) {
  // The following elements have been removed from the latest UML specification and are not supported by the UML metamodel
  const unsupportedTags = new Set(['eAnnotations', 'ownedTrigger', 'xmi:Documentation', 'xmi:Extension', 'XMI_20110701:Extension'])
  const unsupportedTypes = new Set(['CreationEvent', 'DestructionEvent', 'ExecutionEvent', 'ReceiveOperationEvent', 'ReceiveSignalEvent', 'SendOperationEvent', 'SendSignalEvent', 'Signature', 'VariablesDeclaration'])
  function isNil(node: GraphNode) {
    return node.getAttribute('xsi:nil')?.value.literal === 'true' || node.getAttribute('xmi:nil')?.value.literal === 'true'
  }
  model.nodes.forEach((node) => {
    const nodeType = node.getAttribute(Uml.typeAttributeName)?.value.literal
    if (unsupportedTags.has(node.tag)) {
      model.debug('Parser', `Removing unsupported node with tag ${node.tag}`)
      model.removeNode(node)
    } else if (nodeType && unsupportedTypes.has(nodeType)) {
      model.debug('Parser', `Removing unsupported node with type ${nodeType}`)
      model.removeNode(node)
    } else if (isNil(node)) {
      model.debug('Parser', `Removing nil node with tag ${node.tag}`)
      model.removeNode(node)
    }
  })
}

function pruneNodes(model: GraphModel, whitelist: readonly string[], blacklist: readonly string[]) {
  const whitelistSet = new Set(whitelist)
  const blacklistSet = new Set(blacklist)
  model.nodes.forEach((node) => {
    const nodeType = Uml.getType(node)
    if (!nodeType || (!blacklistSet.has(nodeType) && whitelistSet.has(nodeType))) {
      return
    }
    model.debug('Parser', `Removing non-whitelisted node with type ${node.getAttribute(Uml.typeAttributeName)?.value.literal ?? node.tag}`)
    model.removeNode(node)
  })
}

function persistMetadata(model: GraphModel) {
  persistModelName(model)
  persistUmlVersion(model)
  persistXmiVersion(model)
}

function persistModelName(model: GraphModel) {
  const root = model.root
  const name = root.getAttribute('name')?.value.literal
  if (!name) {
    return
  }
  model.metadata.Name = name
}

function persistUmlVersion(model: GraphModel) {
  const root = model.root
  const umlNamespace = root.getAttribute('xmlns:uml')?.value.literal
  if (!umlNamespace) {
    return
  }
  const umlVersionIndicator = 'uml2/'
  const umlVersionStartIndex = umlNamespace.indexOf(umlVersionIndicator)
  const umlVersionEndIndex = umlNamespace.indexOf('/', umlVersionStartIndex + umlVersionIndicator.length)
  model.metadata.UML = umlNamespace.substring(umlVersionStartIndex + umlVersionIndicator.length, umlVersionEndIndex)
}

function persistXmiVersion(model: GraphModel) {
  const root = model.root
  const xmiVersion = root.getAttribute('xmi:version')?.value.literal
  if (!xmiVersion) {
    return
  }
  model.metadata.XMI = xmiVersion
}

function removeNonUmlAttributes(model: GraphModel) {
  const attributesToRemove = new Set<string>(['href'])
  function shouldRemoveAttribute(name: string) {
    if (name.startsWith('xmlns:')) {
      return true
    }
    if (!(name in Uml.Attributes) && (name.startsWith('xmi:') || name.startsWith('xsi'))) {
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
        model.debug('Parser', `Removing non-UML attribute ${name} from ${attributable instanceof GraphNode ? 'node' : 'edge'} ${attributable.getAttribute(model.settings.idAttribute)?.value.literal ?? attributable.tag}`)
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
  node.addAttribute({ name: tag, type: 'string', value: { literal: text } })
}

export const UmlParser = compose(
  createXmiParser(Uml.Attributes['xmi:id'], handleTextNode),
  compose(UmlRefiner, IrPostProcessor),
  'uml',
)
