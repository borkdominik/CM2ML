import type { EncoderParameters, ModelTermFrequencies, TermDocumentMatrix } from './encoder'

export function createTermList(modelTerms: ModelTermFrequencies[], parameters: EncoderParameters): string[] {
  const globalTermFrequencies = new Map<string, number>()

  for (const { terms } of modelTerms) {
    for (const term of terms) {
      globalTermFrequencies.set(term.name, (globalTermFrequencies.get(term.name) ?? 0) + term.frequency)
    }
  }

  return Array.from(globalTermFrequencies.entries())
    .filter(([_, freq]) => freq >= parameters.frequencyCutoff)
    .map(([term]) => term)
}

export function createTermDocumentMatrix(modelTerms: ModelTermFrequencies[], termList: string[], parameters: EncoderParameters): TermDocumentMatrix {
  const matrix: TermDocumentMatrix = {}

  // pre-compute IDF values
  const idfValues: Record<string, number> = {}
  if (parameters.tfIdf) {
    termList.forEach((term) => {
      idfValues[term] = computeIdf(term, modelTerms)
    })
  }

  for (const { modelId, terms } of modelTerms) {
    const termCounts = Object.fromEntries(terms.map((t) => [t.name, t.frequency]))
    const totalTerms = terms.reduce((sum, t) => sum + t.frequency, 0)

    matrix[modelId] = termList.map((term) => {
      const tf = computeTf(termCounts[term] ?? 0, totalTerms, parameters)
      if (parameters.tfIdf) {
        if (!idfValues[term]) {
          throw new Error(`IDF value for term ${term} is undefined`)
        }
        return computeTfIdf(tf, idfValues[term])
      }
      return tf
    })
  }

  return matrix
}

// TF = term count / total number of terms in the document (if normalized)
// Note: some approaches use log(1 + TF), maybe support this too?
function computeTf(termCount: number, totalTerms: number, parameters: EncoderParameters): number {
  return parameters.normalizeTf ? termCount / totalTerms : termCount
}

// IDF = log(number of documents / number of documents containing the term)
function computeIdf(term: string, modelTerms: ModelTermFrequencies[]): number {
  const docCount = modelTerms.length
  const docsWithTerm = modelTerms.filter((m) => m.terms.some((t) => t.name === term)).length
  return Math.log((docCount + 1) / (docsWithTerm + 1)) + 1
}

// TF-IDF = TF * IDF
function computeTfIdf(tf: number, idf: number): number {
  return tf * idf
}
