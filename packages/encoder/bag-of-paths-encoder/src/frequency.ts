import { Stream } from '@yeger/streams'

import type { FrequencyParameters, PatternOrder } from './bop-types'
import type { MinedPattern } from './mining'

export interface PatternWithFrequency<T = string> {
  /**
   * The pattern
   */
  pattern: T[]
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
        patternMap.set(id, { pattern, absoluteFrequency: 0, modelFrequency: 0 })
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

function patternId(pattern: string[]) {
  return pattern.join('$$eu.yeger$$')
}
