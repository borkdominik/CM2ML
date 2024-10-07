import type { StructuredOutput } from '@cm2ml/plugin'
import { ExecutionError, definePlugin } from '@cm2ml/plugin'
import deepEqual from 'fast-deep-equal'

export const DUPLICATE_SYMBOL = Symbol('DUPLICATE')

export type DuplicateSymbol = typeof DUPLICATE_SYMBOL

const name = 'duplicate-filter'

export function filterDuplicates<Data, Metadata>() {
  return definePlugin({
    name,
    parameters: {
      removeDuplicates: {
        type: 'boolean',
        defaultValue: false,
        description: 'Remove duplicate results',
      },
    },
    invoke(batch: StructuredOutput<(Data | ExecutionError)[], Metadata>, parameters) {
      if (!parameters.removeDuplicates) {
        return batch
      }
      return removeDuplicates(batch)
    },
  })
}

function removeDuplicates<Data, Metadata>(batch: StructuredOutput<(Data | ExecutionError)[], Metadata>): StructuredOutput<(Data | ExecutionError | DuplicateSymbol)[], Metadata> {
  const duplicateIndices = new Set<number>()
  const output: (Data | ExecutionError | DuplicateSymbol)[] = []
  const data = batch.data
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
