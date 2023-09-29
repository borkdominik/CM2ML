import type { XmiModel } from '@cm2ml/xmi-model'
import { defineXmiPlugin } from '@cm2ml/xmi-plugin'
import { Stream } from '@yeger/streams'

export const GraphEncoder = defineXmiPlugin({
  name: 'raw-graph',
  parameters: {
    weighted: {
      type: 'boolean',
      description: 'Whether to encode the graph as a weighted matrix.',
      defaultValue: false,
    },
  },
  onInvoke(input, parameters) {
    const sortedIds = getSortedIds(input)
    const matrix = createAdjacencyMatrix(sortedIds.length)
    fillAdjacencyMatrix(matrix, input, sortedIds, parameters.weighted)
    return showMatrix(matrix)
  },
})

function getSortedIds(model: XmiModel) {
  return Stream.from(model.elements)
    .map((element) => element.getAttribute('id')?.value.literal)
    .filterNonNull()
    .toArray()
    .sort((a, b) => a.localeCompare(b))
}

type AdjacencyMatrix = number[][]

function createAdjacencyMatrix(size: number): AdjacencyMatrix {
  const matrix = new Array(size)
  for (let i = 0; i < size; i++) {
    matrix[i] = new Array(size).fill(0)
  }
  return matrix
}

function fillAdjacencyMatrix(
  matrix: AdjacencyMatrix,
  model: XmiModel,
  sortedIds: string[],
  weighted: boolean
) {
  model.references.forEach((reference) => {
    const source = reference.source.getAttribute('id')?.value.literal
    const target = reference.target.getAttribute('id')?.value.literal
    if (source === undefined) {
      throw new Error('Missing id attribute in source element.')
    }
    if (target === undefined) {
      throw new Error('Missing id attribute in target element.')
    }
    const sourceIndex = sortedIds.indexOf(source)
    const targetIndex = sortedIds.indexOf(target)
    const value = weighted ? 1 / reference.target.referencedBy.size : 1
    matrix[sourceIndex]![targetIndex] = value
  })
}

function showMatrix(matrix: AdjacencyMatrix): string {
  return matrix.map((row) => `${row.join(' ')}`).join('\n')
}
