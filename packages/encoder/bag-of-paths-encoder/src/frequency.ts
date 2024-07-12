import { Stream } from '@yeger/streams'

import type { FrequencyParameters } from './bop-types'
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

export function calculateFrequencies(patternsByModel: Stream<MinedPattern[]>, { minAbsoluteFrequency, minModelFrequency }: FrequencyParameters): PatternWithFrequency[] {
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
    .toArray()
    .sort(comparePatternsWithFrequency)
}

function comparePatternsWithFrequency(a: PatternWithFrequency, b: PatternWithFrequency) {
  const aAbsolute = a.absoluteFrequency
  const bAbsolute = b.absoluteFrequency
  if (aAbsolute !== bAbsolute) {
    return bAbsolute - aAbsolute
  }
  const aModel = a.modelFrequency
  const bModel = b.modelFrequency
  if (aModel !== bModel) {
    return bModel - aModel
  }
  return b.pattern.length - a.pattern.length
}

function patternId(pattern: string[]) {
  return pattern.join('$$eu.yeger$$')
}
