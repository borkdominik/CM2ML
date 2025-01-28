import type { EncoderParameters, TermDocumentMatrix } from './encoder'
import type { ExtractedTerm, ModelTerms } from './term-extraction'

export function createTermList(modelTerms: ModelTerms[], parameters: EncoderParameters): string[] {
  const termFrequencies = new Map<string, number>()
  
  modelTerms.forEach(({ terms }) => {
    terms.forEach((term) => {
      const currentFreq = termFrequencies.get(term.name) ?? 0
      termFrequencies.set(term.name, currentFreq + term.occurences)
    })
  })
  
  return Array.from(termFrequencies.entries())
    .filter(([_, frequency]) => frequency >= parameters.frequencyCutoff)
    .map(([term, _]) => term)
}

export function createTermDocumentMatrix(modelTerms: ModelTerms[], termList: string[], parameters: EncoderParameters): TermDocumentMatrix {
  const matrix: TermDocumentMatrix = {}

  modelTerms.forEach(({ modelId, terms }) => {
    const termCounts = countTerms(terms)
    const totalTerms = terms.reduce((sum, term) => sum + term.occurences, 0)

    matrix[modelId] = termList.map((term) => {
      const termCount = termCounts[term] ?? 0
      const tf = computeTf(termCount, totalTerms, parameters)

      if (parameters.tfIdf) {
        const idf = computeIdf(term, modelTerms)
        return computeTfIdf(tf, idf)
      }
      return tf
    })
  })
  return matrix
}

function countTerms(terms: ExtractedTerm[]): Record<string, number> {
  return terms.reduce((counts, term) => {
    counts[term.name] = term.occurences
    return counts
  }, {} as Record<string, number>)
}

// TF = term count / total number of terms in the document (if normalized)
// Note: some approaches use log(1 + TF), maybe support this too?
function computeTf(termCount: number, totalTerms: number, parameters: EncoderParameters): number {
  return parameters.normalizeTf ? termCount / totalTerms : termCount
}

// IDF = log(number of documents / number of documents containing the term)
function computeIdf(term: string, modelTerms: ModelTerms[]): number {
  const documentCount = modelTerms.length
  const documentFrequency = modelTerms.filter((model) =>
    model.terms.some((t) => t.name === term),
  ).length
  return Math.log(documentCount / (documentFrequency || 1))
}

// TF-IDF = TF * IDF
function computeTfIdf(tf: number, idf: number): number {
  return tf * idf
}
