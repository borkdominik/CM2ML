import { Stream } from '@yeger/streams'

import type { MinedPattern } from './mining'
import type { LabeledEdge, SerializedLabeledEdge } from './normalization'
import type { FrequencyParameters, PatternOrder } from './pattern-types'

export type PatternData = SerializedLabeledEdge[]

export interface PatternWithFrequency {
  /**
   * The pattern
   */
  pattern: PatternData
  /**
   * A DOT-notation graph of the pattern.
   */
  graph: string
  /**
   * The total number of occurrences.
   */
  absoluteFrequency: number
  /**
   * The number of models that the pattern occurs in.
   */
  modelFrequency: number
}

export function calculateFrequencies(patternsByModel: Stream<MinedPattern[]>, { minAbsoluteFrequency, minModelFrequency, maxPatterns, patternOrder }: FrequencyParameters): PatternWithFrequency[] {
  const patternMap = new Map<string, PatternWithFrequency>()
  patternsByModel.forEach((modelPatterns) => {
    for (const { pattern, support } of modelPatterns) {
      const id = patternId(pattern)
      if (!patternMap.has(id)) {
        patternMap.set(id, {
          pattern: pattern.map((edge) => edge.serialize()),
          graph: `digraph G {
            ${pattern.map((edge) => edge.id).join('\n')}
          }`,
          absoluteFrequency: 0,
          modelFrequency: 0,
        })
      }
      const entry = patternMap.get(id)!
      entry.absoluteFrequency += support
      entry.modelFrequency++
    }
  })
  return Stream
    .from(patternMap.values())
    .filter((pattern) => pattern.absoluteFrequency >= minAbsoluteFrequency && pattern.modelFrequency >= minModelFrequency)
    .limit(maxPatterns)
    .toArray()
    .sort((a, b) => comparePatternsWithFrequency(a, b, patternOrder))
}

function comparePatternsWithFrequency(a: PatternWithFrequency, b: PatternWithFrequency, priority: PatternOrder) {
  const aAbsolute = a.absoluteFrequency
  const bAbsolute = b.absoluteFrequency
  const absDiff = bAbsolute - aAbsolute

  const aModel = a.modelFrequency
  const bModel = b.modelFrequency
  const modelDiff = bModel - aModel

  const patternLengthDiff = b.pattern.length - a.pattern.length

  const order = priority === 'absolute-frequency' ? [absDiff, modelDiff, patternLengthDiff] : [modelDiff, absDiff, patternLengthDiff]

  for (const value of order) {
    if (value !== 0) {
      return value
    }
  }
  return 0
}

function patternId(pattern: LabeledEdge[]) {
  return pattern.map((edge) => edge.id).join('$$eu.yeger$$')
}
