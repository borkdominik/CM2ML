import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { definePlugin } from '@cm2ml/plugin'
import { Stream } from '@yeger/streams'
import { stemmer } from 'stemmer'

export interface Term {
  // nodeId optionally provided for traceability
  nodeId?: string
  name: string
}

// TODO: Fix ModelTerms in index.ts and rename this back to `ModelTerms`
export interface ModelTerms2 {
  modelId: string
  terms: Term[]
}

export interface TermExtractionConfig {
  // inclusion
  includeNames: boolean
  includeTypes: boolean
  includedAttributes: readonly string[]

  // filtering
  minTermLength: number
  maxTermLength: number
  stopWords: readonly string[]

  // normalization
  tokenize: boolean
  termDelimiters: readonly string[]
  lowercase: boolean
  stem: boolean

  // output
  includeNodeIds: boolean
  separateViews?: boolean
}

export const termExtractor = definePlugin({
  name: 'term-extractor',
  parameters: {
    includeNames: {
      type: 'boolean',
      defaultValue: true,
      description: 'Extract element names as terms',
      displayName: 'Include names',
      group: 'inclusion',
    },
    includeTypes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Extract element types as terms',
      displayName: 'Include types',
      group: 'inclusion',
    },
    includedAttributes: {
      type: 'list<string>',
      defaultValue: [],
      description: 'Attributes to include as terms',
      displayName: 'Included attributes',
      group: 'inclusion',
    },
    minTermLength: {
      type: 'number',
      defaultValue: 1,
      description: 'Minimum length of terms',
      displayName: 'Min term length',
      group: 'filtering',
    },
    maxTermLength: {
      type: 'number',
      defaultValue: 100,
      description: 'Maximum length of terms',
      displayName: 'Max term length',
      group: 'filtering',
    },
    stopWords: {
      type: 'list<string>',
      defaultValue: [],
      description: 'List of stop words to exclude from term list',
      displayName: 'Stop words',
      group: 'filtering',
    },
    tokenize: {
      type: 'boolean',
      defaultValue: false,
      description: 'Split and clean terms into separate tokens (controlled by term delimiters)',
      displayName: 'Tokenize terms',
      group: 'normalization',
    },
    termDelimiters: {
      type: 'list<string>',
      defaultValue: [' ', '-', '_'],
      description: 'Delimiters used to split tokens',
      displayName: 'Term delimiters',
      group: 'normalization',
    },
    lowercase: {
      type: 'boolean',
      defaultValue: true,
      description: 'Convert terms to lowercase',
      displayName: 'Lowercase terms',
      group: 'normalization',
    },
    stem: {
      type: 'boolean',
      defaultValue: false,
      description: 'Apply stemming to terms',
      displayName: 'Stem terms',
      group: 'normalization',
    },
    includeNodeIds: {
      type: 'boolean',
      defaultValue: true,
      description: 'Include node IDs in term output',
      displayName: 'Include Node IDs',
      group: 'output',
    },
    separateViews: {
      type: 'boolean',
      defaultValue: false,
      description: 'Handle each view separately',
      displayName: 'Separate Views',
      group: 'output',
    },
  },
  invoke: (models: GraphModel[], parameters) => {
    const stopWords = new Set(parameters.stopWords.map((w) => w.toLowerCase()))

    return models.flatMap((model: GraphModel): ModelTerms2[] => {
      if (!model.root.id) {
        throw new Error('Model ID is undefined')
      }
      const modelId = model.root.id

      if (parameters.separateViews) {
        // TODO: Validate if metamodel language is ArchiMate (disable for other languages)
        const views = Stream.from(model.nodes).filter((n) => n.type === 'ArchimateDiagramModel').toArray()
        if (views.length === 0) {
          throw new Error('No View elements found! Enable \'viewsAsNodes\' when using \'separateViewIds\'')
        }
        return views.map((view) => {
          const containedNodes = Stream.from(view.outgoingEdges).map((e) => e.target).toArray()
          expandContainedNodesWithRelations(containedNodes)
          const terms: Term[] = containedNodes.flatMap((node) =>
            extractTermsFromNode(node, parameters, stopWords),
          )
          return {
            modelId: `${modelId}--__--${view.id}`,
            terms,
          }
        })
      } else {
        const terms: Term[] = []
        model.nodes.forEach((node) => {
          const nodeTerms = extractTermsFromNode(node, parameters, stopWords)
          terms.push(...nodeTerms)
        })
        return [{
          modelId,
          terms,
        }]
      }
    })
  },
})

export function expandContainedNodesWithRelations(containedNodes: GraphNode[]): void {
  for (const node of [...containedNodes]) {
    const relEdges = Stream.from(node.incomingEdges).filter((e) => e.tag === 'source' || e.tag === 'target').toArray()
    for (const edge of relEdges) {
      const relNode = edge.source
      if (!containedNodes.includes(relNode)) {
        const relOut = Stream.from(relNode.outgoingEdges).toArray()
        if (relOut.length === 2) {
          const connected = relOut.map((e) => e.target)
          if (connected.includes(node) && connected.some((n) => containedNodes.includes(n))) {
            containedNodes.push(relNode)
          }
        }
      }
    }
  }
}

function extractTermsFromNode(node: GraphNode, config: TermExtractionConfig, stopWords: Set<string>): Term[] {
  const nodeId = node.id
  const terms: Term[] = []

  if (!nodeId) {
    return terms
  }

  if (config.includeNames) {
    const name = node.getAttribute('name')?.value.literal
    if (name) {
      terms.push(...processValue(name, nodeId, config, stopWords))
    }
  }

  if (config.includeTypes && node.type) {
    terms.push(...processValue(node.type, nodeId, { ...config, tokenize: false, stem: false }, stopWords))
  }

  for (const attr of config.includedAttributes) {
    const value = node.getAttribute(attr)?.value.literal
    if (value) {
      terms.push(...processValue(value, nodeId, config, stopWords))
    }
  }

  return terms
}

function processValue(value: string, nodeId: string, config: TermExtractionConfig, stopWords: Set<string>): Term[] {
  if (!value) {
    return []
  }

  let tokens = config.tokenize ? tokenize(value, config.termDelimiters) : [value]
  if (config.lowercase) {
    tokens = tokens.map((t) => t.toLowerCase())
  }
  if (config.stem) {
    tokens = tokens.map((t) => stemmer(t))
  }

  return tokens
    .filter((t) =>
      t.length >= config.minTermLength &&
      t.length <= config.maxTermLength &&
      !stopWords.has(t),
    )
    .map((t) => config.includeNodeIds ? { nodeId, name: t } : { name: t })
}

function tokenize(text: string, delimiters: readonly string[]): string[] {
  const delimiterSet = new Set(delimiters)

  // replace any character that is a delimiter or matches whitespace/punctuation with a space
  let normalized = ''
  for (const char of text) {
    if (delimiterSet.has(char) || /\s|\p{P}/u.test(char)) {
      normalized += ' '
    } else {
      normalized += char
    }
  }

  return normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
}
