// TODO: remove unused functions
// TODO: implement separateViews before deleting

import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'
import levenshtein from 'fast-levenshtein'
import { stemmer } from 'stemmer'

export * from './bi-gram'
export * from './embeddings'
export * from './n-gram'
export * from './stop-words'
export * from './term-extraction'

export interface ExtractedTerm {
  nodeId: string
  name: string
  occurences: number
}

export interface ModelTerms {
  modelId: string
  terms: ExtractedTerm[]
}

export const biGramTermTypes = ['name', 'type', 'attribute'] as const
export type BiGramTermType = typeof biGramTermTypes[number] | string & Record<never, never>

export interface TermParameters {
  separateViewIds: boolean
  namesAsTerms: boolean
  typesAsTerms: boolean
  attributesAsTerms: readonly string[]
  tokenize: boolean
  stem: boolean
  stopWords: readonly string[]
  normalizeTf: boolean
  tfIdf: boolean
  frequencyCutoff: number
  // bi-gram
  bigramEnabled: boolean
  bigramSeparator: string
  bigramFirstTerm: BiGramTermType
  bigramFirstTermAttribute: string
  bigramSecondTerm: BiGramTermType
  bigramSecondTermAttribute: string
}

export function extractModelTerms(models: GraphModel[], parameters?: TermParameters): ModelTerms[] {
  return models.flatMap((model) => {
    if (!model.root.id) {
      throw new Error('Model ID is undefined')
    }
    const modelId = model.root.id
    if (parameters?.separateViewIds) {
      // TODO: Validate if metamodel language is ArchiMate (disable for other languages)
      const views = Stream.from(model.nodes).filter((n) => n.type === 'ArchimateDiagramModel').toArray()
      if (views.length === 0) {
        throw new Error('No View elements found! Make sure to use the \'viewsAsNodes\' parameter when using \'separateViewIds\'')
      }
      return views.map((view) => {
        return {
          modelId: `${modelId}--__--${view.id}`,
          terms: extractViewTerms(view, parameters),
        }
      })
    } else {
      return [{
        modelId,
        terms: extractTerms(model, parameters),
      }]
    }
  })
}

function extractTerms(model: GraphModel, parameters?: TermParameters): ExtractedTerm[] {
  const termMap = extractTermsFromNodes(Stream.from(model.nodes).toArray(), parameters)
  return Array.from(termMap.values())
}

function extractViewTerms(view: GraphNode, parameters: TermParameters): ExtractedTerm[] {
  const containedNodes = Stream.from(view.outgoingEdges).map((e) => e.target).toArray()
  expandContainedNodesWithRelations(containedNodes)
  const termMap = extractTermsFromNodes(containedNodes, parameters)
  return Array.from(termMap.values())
}

function expandContainedNodesWithRelations(containedNodes: GraphNode[]): void {
  for (const node of containedNodes) {
    const relevantEdges = Stream.from(node.incomingEdges).filter((e) => e.tag === 'source' || e.tag === 'target').toArray()
    for (const edge of relevantEdges) {
      const relNode = edge.source
      const relNodeOutgoingEdges = Stream.from(relNode.outgoingEdges).toArray()
      // validate relationship node
      if (relNodeOutgoingEdges.length !== 2) {
        throw new Error(`Unexpected Relationship Node '${relNode.tag}' should have exactly 2 outgoing edges`)
      }
      for (const relEdge of relNodeOutgoingEdges) {
        const connectedNode = relEdge.target
        if (connectedNode !== node && containedNodes.includes(connectedNode) && !containedNodes.includes(relNode)) {
          containedNodes.push(relNode)
        }
      }
    }
  }
}

function extractTermsFromNodes(nodes: GraphNode[], parameters?: TermParameters): Map<string, ExtractedTerm> {
  const termMap = new Map<string, ExtractedTerm>()
  for (const node of nodes) {
    if (parameters?.bigramEnabled) {
      const firstTerm = getTermValue(node, parameters.bigramFirstTerm, parameters.bigramFirstTermAttribute)
      const secondTerm = getTermValue(node, parameters.bigramSecondTerm, parameters.bigramSecondTermAttribute)

      if (firstTerm && secondTerm) {
        const bigram = `${firstTerm}${parameters.bigramSeparator}${secondTerm}`
        updateOrAddTerm(termMap, node.id!, bigram)
      }
    } else {
      // process names
      if (parameters?.namesAsTerms) {
        processTerms(termMap, node.id!, node.getAttribute('name')?.value.literal, parameters)
      }

      // process types (do not tokenize)
      if (parameters?.typesAsTerms && node.type) {
        updateOrAddTerm(termMap, node.id!, node.type)
      }

      // process additional attributes (if parameter is set)
      parameters?.attributesAsTerms?.forEach((attr) => processTerms(termMap, node.id!, node.getAttribute(attr)?.value.literal, parameters))
    }
  }
  return termMap
}

function processTerms(termMap: Map<string, ExtractedTerm>, nodeId: string, value: string | undefined, parameters: TermParameters) {
  if (!value) {
    return
  }

  const terms = parameters.tokenize ? tokenize(value) : [value]
  const stopWords = new Set(parameters.stopWords)

  terms.forEach((term: string) => {
    const processedTerm = parameters.stem ? stemmer(term) : term
    if (!stopWords.has(processedTerm)) {
      updateOrAddTerm(termMap, nodeId, processedTerm)
    }
  })
}

function updateOrAddTerm(termMap: Map<string, ExtractedTerm>, nodeId: string, termName: string) {
  if (termMap.has(termName)) {
    const term = termMap.get(termName)!
    term.occurences++
  } else {
    termMap.set(termName, { nodeId, name: termName, occurences: 1 })
  }
}

function getTermValue(node: GraphNode, termType: BiGramTermType, attributeName: string): string | undefined {
  if (termType === 'name') {
    return node.getAttribute('name')?.value.literal
  } else if (termType === 'type') {
    return node.type
  } else if (termType === 'attribute') {
    return node.getAttribute(attributeName)?.value.literal
  }
  return undefined
}

function tokenize(text: string): string[] {
  // split text into words, considering spaces and punctuation as separators
  const rawTokens = text.split(/[\s\p{P}]+/u)
  // convert to lowercase and remove empty characters
  return rawTokens
    .map((token) => token.toLowerCase().replace(/\W+/g, ''))
    .filter((token) => token.length > 0)
}

export function getMostSimilarWord(term: string, index: Map<string, number>): string | null {
  let closestWord = null
  let minDistance = Infinity
  for (const word of index.keys()) {
    const distance = levenshtein.get(term, word)
    if (distance < minDistance) {
      minDistance = distance
      closestWord = word
    }
  }
  return closestWord
}
