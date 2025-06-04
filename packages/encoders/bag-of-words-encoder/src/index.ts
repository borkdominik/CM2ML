import type { GraphEdge } from '@cm2ml/ir'
import { GraphModel } from '@cm2ml/ir'
import type { Term, ModelTerms2 } from '@cm2ml/nlp-utils'
import { termExtractor } from '@cm2ml/nlp-utils'
import { defineStructuredBatchPlugin, ExecutionError } from '@cm2ml/plugin'

export interface BoWEncoderParameters {
  // term extraction
  includeNames: boolean
  includeTypes: boolean
  includedAttributes: readonly string[]
  minTermLength: number
  maxTermLength: number
  stopWords: readonly string[]
  tokenize: boolean
  termDelimiters: readonly string[]
  lowercase: boolean
  stem: boolean

  includeNodeIds: boolean
  separateViews: boolean
  // bow-specific
  removeDuplicates: boolean
  // Sentence Encoding
  encodeAsSentence: boolean
  encodeRelationships: boolean
}

export const BagOfWordsEncoder = defineStructuredBatchPlugin({
  name: 'bag-of-words',
  parameters: {
    includeNames: {
      type: 'boolean',
      defaultValue: true,
      description: 'Encode names as terms',
      group: 'terms',
      displayName: 'Names as terms',
    },
    includeTypes: {
      type: 'boolean',
      defaultValue: false,
      description: 'Encode types as terms',
      group: 'terms',
      displayName: 'Types as terms',
    },
    includedAttributes: {
      type: 'list<string>',
      defaultValue: [],
      description: 'Additional attributes to encode as terms',
      group: 'terms',
      displayName: 'Attributes as terms',
    },
    minTermLength: {
      type: 'number',
      defaultValue: 1,
      description: 'Minimum term length',
      group: 'filtering',
      displayName: 'Min term length',
    },
    maxTermLength: {
      type: 'number',
      defaultValue: 100,
      description: 'Maximum length of terms',
      displayName: 'Max term length',
      group: 'filtering',
    },
    removeDuplicates: {
      type: 'boolean',
      defaultValue: false,
      description: 'Remove duplicate terms so that each term appears only once per model',
      group: 'filtering',
      displayName: 'Remove duplicates',
    },
    stopWords: {
      type: 'list<string>',
      defaultValue: [],
      description: 'List of stop words to exclude',
      group: 'filtering',
      displayName: 'Stop words',
    },
    tokenize: {
      type: 'boolean',
      defaultValue: true,
      description: 'Split and clean terms into separate tokens (controlled by term delimiters)',
      group: 'normalization',
      displayName: 'Tokenize terms',
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
      group: 'normalization',
      displayName: 'Lowercase terms',
    },
    stem: {
      type: 'boolean',
      defaultValue: false,
      description: 'Apply stemming to terms',
      group: 'normalization',
      displayName: 'Stem terms',
    },
    includeNodeIds: {
      type: 'boolean',
      defaultValue: true,
      description: 'Include node IDs in output terms',
      group: 'output',
      displayName: 'Include Node IDs',
    },
    separateViews: {
      type: 'boolean',
      defaultValue: false,
      description: 'Separate Views',
      group: 'output',
      displayName: 'Separate Views',
    },
    encodeAsSentence: {
      type: 'boolean',
      defaultValue: false,
      description: 'Encode nodes as sentences',
      group: 'sentence',
      displayName: 'Encode as sentence',
    },
    encodeRelationships: {
      type: 'boolean',
      defaultValue: false,
      description: 'Include relationships in sentences',
      group: 'sentence',
      displayName: 'Encode relationships',
    },
  },
  invoke(input: (GraphModel | ExecutionError)[], parameters: BoWEncoderParameters) {
    validateParameters(parameters)
    const models = filterValidModels(input)
    let modelTerms: ModelTerms2[]

    if (parameters.encodeAsSentence) {
      modelTerms = models.map((model) => ({
        modelId: model.root.id!,
        terms: extractSentences(model, parameters),
      }))
    } else {
      modelTerms = termExtractor.invoke(models, {
        includeNames: parameters.includeNames,
        includeTypes: parameters.includeTypes,
        includedAttributes: parameters.includedAttributes,
        tokenize: parameters.tokenize,
        termDelimiters: parameters.termDelimiters,
        lowercase: parameters.lowercase,
        stem: parameters.stem,
        stopWords: parameters.stopWords,
        minTermLength: parameters.minTermLength,
        maxTermLength: parameters.maxTermLength,
        includeNodeIds: parameters.includeNodeIds,
        separateViews: parameters.separateViews,
      })
      if (parameters.removeDuplicates) {
        modelTerms = removeDuplicateTerms(modelTerms)
      }
    }

    return input.map((item) => {
      if (item instanceof ExecutionError) {
        return item
      }
      return {
        data: { modelId: item.root.id },
        metadata: modelTerms,
      }
    })
  },
})

function filterValidModels(input: (GraphModel | ExecutionError)[]): GraphModel[] {
  return input.filter((item) => item instanceof GraphModel)
}

function removeDuplicateTerms(modelTerms: ModelTerms2[]): ModelTerms2[] {
  return modelTerms.map(({ modelId, terms }) => {
    const seen = new Set<string>()
    const uniqueTerms = terms.filter((term) => {
      if (seen.has(term.name)) {
        return false
      }
      seen.add(term.name)
      return true
    })
    return { modelId, terms: uniqueTerms }
  })
}

const verbMap: Record<string, string> = {
  'AssociationRelationship': 'associates with',
  'RealizationRelationship': 'realizes',
  'ServingRelationship': 'serves',
  'FlowRelationship': 'flows to',
  'AggregationRelationship': 'aggregates',
  'InfluenceRelationship': 'influences',
  'CompositionRelationship': 'composes',
  'TriggeringRelationship': 'triggers',
  'AssignmentRelationship': 'assigns',
  'SpecializationRelationship': 'specializes',
  'AccessRelationship': 'accesses',
}

function extractSentences(model: GraphModel, params: BoWEncoderParameters): Term[] {
  const terms: Term[] = []

  // TODO: handle relationships as nodes parameter?
  if (params.encodeRelationships) {
    model.edges.forEach((edge) => {
      if (!(edge.tag in verbMap)) {
        return
      }

      const sourceNode = model.getNodeById(edge.source.id!)
      const targetNode = model.getNodeById(edge.target.id!)

      if (sourceNode && targetNode) {
        const sourceName = sourceNode.getAttribute('name')?.value.literal
        const targetName = targetNode.getAttribute('name')?.value.literal

        if (sourceName && targetName) {
          const relationSentence = `${sourceNode.type}: ${sourceName} ${mapToVerb(edge)} ${targetNode.type}: ${targetName}.`
          terms.push({ nodeId: sourceNode.id!, name: relationSentence })
        }
      }
    })
  } else {
    model.nodes.forEach((node) => {
      const nodeId = node.id
      if (!nodeId) {
        return
      }

      const sentenceParts: string[] = []

      if (params.includeNames) {
        const name = node.getAttribute('name')?.value.literal
        if (name && params.includeTypes) {
          sentenceParts.push(`${node.type}: ${name}`)
        } else if (name && !params.includeTypes) {
          sentenceParts.push(name)
        }
      }

      // attributes not supported
      const sentence = `${sentenceParts.join('. ')}.`
      if (sentence.length === 1) {
        return
      }
      terms.push({ nodeId, name: sentence })
    })
  }

  return terms
}

function mapToVerb(edge: GraphEdge): string {
  const verb = verbMap[edge.tag]
  if (!verb) {
    throw new Error(`Cannot map edge to verb. Unknown edge tag: ${edge.tag}`)
  }
  return verb
}

function validateParameters(params: BoWEncoderParameters): void {
  if (params.encodeRelationships && !params.encodeAsSentence) {
    throw new Error('encodeRelationships can only be enabled if encodeAsSentence is true.')
  }
  if (params.encodeAsSentence && params.separateViews) {
    throw new Error('separateViews not supported for sentence encoding.')
  }
}
