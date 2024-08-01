import type { GraphModel } from '@cm2ml/ir'
import type { InferOut } from '@cm2ml/plugin'
import { ExecutionError, batchTryCatch, compose, definePlugin } from '@cm2ml/plugin'

export interface ExtractedTerm {
  id: number
  type: string
  name: string
};

export type TermDocumentMatrix = Record<string, number[]>

export interface TermFrequencyEncoding {
  termDocumentMatrix: TermDocumentMatrix
  termList: string[]
  modelIds: string[]
}

// TODO:
// - handle relationships + views
// - uni-gram: names
// - bi-gram: names + containment?
// - n-gram: names + containment + types?
const TermExtractor = batchTryCatch(definePlugin({
  name: 'term-extractor',
  parameters: {},
  invoke(model: GraphModel, _parameters) {
    return {
      data: Array.from(model.nodes).map((node, index) => ({
        id: index + 1,
        type: node.type ?? '',
        name: node.getAttribute('name')?.value.literal ?? '',
      })),
      metadata: {
        modelId: model.root.id,
      },
    }
  },
}))

const TermFrequencyExtractor = definePlugin({
  name: 'term-frequency-extractor',
  parameters: {
    normalizeTf: {
      type: 'boolean',
      description: 'Normalize Term Frequency (TF) by total number of terms in the document',
      defaultValue: false,
      group: 'term-frequency',
    },
    computeTfIdf: {
      type: 'boolean',
      description: 'Compute Inverse Document Frequency (IDF)',
      defaultValue: false,
      group: 'term-frequency',
    },
  },
  invoke(batch: InferOut<typeof TermExtractor>, parameters) {
    const validItems = filterValidItems(batch)
    const { termList, termIndex } = collectUniqueTerms(validItems)
    const documentFrequency: number[] = Array.from({ length: termList.length }).fill(0)
    const termDocumentMatrix: TermDocumentMatrix = {}

    validItems.forEach((item) => {
      const docVector = Array.from({ length: termList.length }).fill(0)
      const termSet = new Set<number>()

      item.data.forEach((term) => {
        const index = termIndex.get(term.name)
        if (index !== undefined) {
          docVector[index]++
          termSet.add(index)
        }
      })
      termSet.forEach((term) => {
        if (documentFrequency[term]) {
          documentFrequency[term]++
        }
      })

      if (parameters.normalizeTf) {
        normalizeTf(docVector, item.data.length)
      }
      if (item.metadata.modelId) {
        termDocumentMatrix[item.metadata.modelId] = docVector
      }
    })

    if (parameters.computeTfIdf) {
      applyTfIdf(termDocumentMatrix, documentFrequency, validItems.length)
    }

    const modelIds = validItems.map((item) => item.metadata.modelId)
    return validItems.map(() => ({
      metadata: {
        modelIds,
        termDocumentMatrix,
        termList,
      },
    }))
  },
})

function filterValidItems(batch: InferOut<typeof TermExtractor>) {
  return batch.filter((item): item is Exclude<typeof item, ExecutionError> =>
    !(item instanceof ExecutionError) && 'data' in item && Array.isArray(item.data),
  )
}

function collectUniqueTerms(validItems: ReturnType<typeof filterValidItems>): { termList: string[], termIndex: Map<string, number> } {
  const allTerms = new Set<string>()
  validItems.forEach((item) => {
    item.data.forEach((term) => {
      allTerms.add(term.name)
    })
  })
  const termList = Array.from(allTerms)
  const termIndex = new Map(termList.map((term, index) => [term, index]))
  return { termList, termIndex }
}

// normalize term frequencies by total number of terms in the document
function normalizeTf(docVector: number[], totalTermsInDoc: number) {
  if (totalTermsInDoc <= 0) {
    throw new Error('Cannot normalize term frequency: total terms in document is zero or negative.')
  }
  docVector.forEach((tf, index) => {
    docVector[index] = tf / totalTermsInDoc
  })
}

function applyTfIdf(termDocumentMatrix: TermDocumentMatrix, documentFrequency: number[], totalDocuments: number) {
  const idf = computeIdf(documentFrequency, totalDocuments)
  Object.keys(termDocumentMatrix).forEach((modelId) => {
    if (termDocumentMatrix[modelId]) {
      termDocumentMatrix[modelId] = termDocumentMatrix[modelId].map((tf, index) => {
        // compute TF-IDF = TF * IDF
        const tfidf = tf * (idf[index] ?? 0)
        return Number(tfidf.toFixed(4))
      })
    }
  })
}

function computeIdf(docFrequency: number[], totalDocs: number) {
  // compute IDF = log(totalDocs / (docFrequency + 1))
  return docFrequency.map((freq) => Number((Math.log(totalDocs / (freq + 1)))))
}

export const TermFrequencyEncoder = compose(TermExtractor, TermFrequencyExtractor, 'term-frequency')
