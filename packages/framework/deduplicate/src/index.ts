import type { StructuredOutput } from '@cm2ml/plugin'
import { ExecutionError, definePlugin } from '@cm2ml/plugin'
import deepEqual from 'fast-deep-equal'

export const DUPLICATE_SYMBOL = Symbol('DUPLICATE')

export type DuplicateSymbol = typeof DUPLICATE_SYMBOL

const name = 'deduplicate'

export function deduplicate<Data, Metadata>() {
  return definePlugin({
    name,
    parameters: {
      deduplicate: {
        type: 'boolean',
        defaultValue: false,
        description: 'Remove duplicate results',
      },
      deduplicationData: {
        type: 'list<string>',
        unique: false,
        ordered: false,
        defaultValue: [],
        description: 'Additional data to check for duplicates. Must be a serialization of deduplicated batch output.',
        processFile: (content: string) => content,
      },
    },
    invoke(batch: StructuredOutput<(Data | ExecutionError)[], Metadata>, { deduplicate, deduplicationData }) {
      if (!deduplicate) {
        return batch
      }
      return removeDuplicates(batch, deduplicationData.flatMap((data) => extractDeduplicationData(data)))
    },
  })
}

function extractDeduplicationData(additionalData: string): unknown[] {
  if (additionalData === '') {
    return []
  }
  const parsed: unknown = JSON.parse(additionalData)
  if (Array.isArray(parsed)) {
    return parsed
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new ExecutionError('Invalid duplication data', name)
  }
  if (!('data' in parsed)) {
    throw new ExecutionError('Invalid duplication data', name)
  }
  const data: unknown = parsed.data
  if (Array.isArray(data)) {
    return data
  }
  if (typeof data !== 'object' || data === null) {
    throw new ExecutionError('Invalid duplication data', name)
  }
  return Object.values(data)
}

function removeDuplicates<Data, Metadata>(batch: StructuredOutput<(Data | ExecutionError)[], Metadata>, additionalData: unknown[]): StructuredOutput<(Data | ExecutionError | DuplicateSymbol)[], Metadata> {
  const duplicateIndices = new Set<number>()
  const output: (Data | ExecutionError | DuplicateSymbol)[] = []
  const data = batch.data
  additionalData.forEach((additionalEntry) => {
    data.forEach((entry, index) => {
      if (deepEqual(additionalEntry, entry)) {
        duplicateIndices.add(index)
      }
    })
  })
  data.forEach((entry, index) => {
    if (duplicateIndices.has(index)) {
      output.push(DUPLICATE_SYMBOL)
      return
    }
    output.push(entry)
    if (entry instanceof ExecutionError) {
      return
    }
    for (let otherIndex = index + 1; otherIndex < data.length; otherIndex++) {
      if (duplicateIndices.has(otherIndex)) {
        continue
      }
      const otherEntry = data[otherIndex]!
      if (otherEntry instanceof ExecutionError) {
        continue
      }
      if (deepEqual(entry, otherEntry)) {
        duplicateIndices.add(otherIndex)
      }
    }
  })
  return { data: output, metadata: batch.metadata }
}
