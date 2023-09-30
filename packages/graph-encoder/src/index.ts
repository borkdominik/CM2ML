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
    sparse: {
      type: 'boolean',
      description: 'Whether to encode the graph as a sparse list.',
      defaultValue: false,
    },
  },
  onInvoke(input, { sparse, weighted }) {
    if (sparse && weighted) {
      throw new Error('Sparse and weighted encoding are mutually exclusive.')
    }
    const sortedIds = getSortedIds(input)
    if (sparse) {
      return encodeAsSparseList(input, sortedIds)
    }
    return encodeAsAdjacencyMatrix(input, sortedIds, weighted)
  },
})

function getSortedIds(model: XmiModel) {
  return Stream.from(model.elements)
    .map((element) => element.getAttribute('id')?.value.literal)
    .filterNonNull()
    .toArray()
    .sort((a, b) => a.localeCompare(b))
}

function encodeAsSparseList(model: XmiModel, sortedIds: string[]) {
  const list = new Array<[number, number]>()
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
    list.push([sourceIndex, targetIndex] as const)
  })
  return list
}

type AdjacencyMatrix = number[][]

function encodeAsAdjacencyMatrix(
  model: XmiModel,
  sortedIds: string[],
  weighted: boolean
) {
  const matrix = createAdjacencyMatrix(sortedIds.length)
  fillAdjacencyMatrix(matrix, model, sortedIds, weighted)
  return matrix
}

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
