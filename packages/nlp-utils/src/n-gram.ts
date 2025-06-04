import type { GraphModel, GraphNode } from '@cm2ml/ir'
import { Stream } from '@yeger/streams'

import type { ModelTerms2 } from '.'
import { expandContainedNodesWithRelations } from '.'

export function extractNGrams(models: GraphModel[], nGramLength: number, keepLowerLengthPaths: boolean, undirected: boolean, separateViewIds?: boolean): ModelTerms2[] {
  return models.flatMap((model) => {
    const modelId = model.root.id
    if (!modelId) {
      throw new Error('Model ID is undefined')
    }

    if (separateViewIds) {
      const views = Stream.from(model.nodes).filter((n) => n.type === 'ArchimateDiagramModel').toArray()
      if (views.length === 0) {
        throw new Error('No View elements found! Enable \'viewsAsNodes\' when using \'separateViewIds\'')
      }
      return views.map((view) => {
        const containedNodes = Stream.from(view.outgoingEdges).map((e) => e.target).toArray()
        expandContainedNodesWithRelations(containedNodes)
        const sequences = getSequences(containedNodes, nGramLength, keepLowerLengthPaths, undirected)
        const formatted = sequences.map((seq) => `(${seq.map((e) => e.name).join(', ')})`)

        return {
          modelId: `${modelId}--__--${view.id}`,
          terms: formatted.map((seq, idx) => ({
            nodeId: sequences[idx]![0]!.id,
            name: seq,
          })),
        }
      })
    } else {
      const nodes = Stream.from(model.nodes).toArray()
      const sequences = getSequences(nodes, nGramLength, keepLowerLengthPaths, undirected)
      const formattedSequences = sequences.map((seq) => `(${seq.map((entry) => entry.name).join(', ')})`)
      return [{
        modelId,
        terms: formattedSequences.map((seq, index) => ({
          nodeId: sequences[index]![0]!.id,
          name: seq,
          // occurences: 1
        })),
      }]
    }
  })
}

function getSequences(nodes: GraphNode[], length: number, keepLowerLengthPaths: boolean, undirected: boolean): { id: string, name: string }[][] {
  const sequences: { id: string, name: string }[][] = []
  for (const node of nodes) {
    // skip root node (i.e. node corresponding to the model)
    if (node.type === 'model') {
      continue
    }
    const nodeId = node.id
    const nodeName = node.getAttribute('name')?.value.literal ?? ''

    if (!nodeId || !nodeName) {
      continue
    }

    const paths = findPathsFromNode(node, length, undirected)
    for (const path of paths) {
      if (path.length === length || (keepLowerLengthPaths && path.length < length)) {
        sequences.push(path.map((n) => ({ id: n.id!, name: n.getAttribute('name')?.value.literal ?? '' })))
      }
    }
  }
  return sequences
}

function findPathsFromNode(startNode: GraphNode, maxLength: number, undirected: boolean): GraphNode[][] {
  const paths: GraphNode[][] = []

  function dfs(current: GraphNode, path: GraphNode[]) {
    const newPath = [...path, current]

    if (newPath.length > 1 && newPath.length <= maxLength) {
      paths.push(newPath) // capture valid sub-paths
    }

    if (newPath.length >= maxLength) {
      return
    }

    const neighbors = new Set<GraphNode>()
    for (const edge of current.outgoingEdges) {
      if (edge.target) {
        neighbors.add(edge.target)
      }
    }
    if (undirected) {
      for (const edge of current.incomingEdges) {
        if (edge.source) {
          neighbors.add(edge.source)
        }
      }
    }

    for (const neighbor of neighbors) {
      if (!newPath.includes(neighbor)) {
        dfs(neighbor, newPath)
      }
    }
  }

  dfs(startNode, [])
  return paths
}

/*
function findPaths(node: GraphNode, length: number, undirected: boolean, path: GraphNode[] = []): GraphNode[][] {
    if (path.length === length) return [path];

    const newPath = [...path, node];
    const sequences: GraphNode[][] = [];

    if (newPath.length < length) {
        const edges = [...node.outgoingEdges];
        if (undirected) {
            edges.push(...node.incomingEdges); // Consider incoming edges for undirected paths
        }

        for (const edge of edges) {
            if (edge.target && !newPath.includes(edge.target)) {
                sequences.push(...findPaths(edge.target, length, undirected, newPath));
            }
        }
    }

    return sequences.length > 0 ? sequences : [newPath];
}
*/

/*
function extractNGramTerms(nodes: GraphNode[], nGramLength: number): TermWithOccurence[] {
    const termSequences: string[][] = [];

    for (const node of nodes) {
        const termSequence = extractNodeTerms(node);
        if (termSequence.length >= nGramLength) {
            termSequences.push(...generateNGrams(termSequence, nGramLength));
        }
    }

    const termMap = new Map<string, TermWithOccurence>();

    for (const sequence of termSequences) {
        const nGram = `(${sequence.join(", ")})`;
        if (termMap.has(nGram)) {
            termMap.get(nGram)!.occurences++;
        } else {
            termMap.set(nGram, { nodeId: sequence[0]!, name: nGram, occurences: 1 });
        }
    }

    return Array.from(termMap.values());
}

function extractNodeTerms(node: GraphNode): string[] {
    const terms: string[] = [];

    if (node.getAttribute("name")?.value.literal) {
        terms.push(node.getAttribute("name")!.value.literal);
    }
    if (node.type) {
        terms.push(node.type);
    }
    return terms;
}

function generateNGrams(sequence: string[], n: number): string[][] {
    const nGrams: string[][] = [];
    for (let i = 0; i <= sequence.length - n; i++) {
        nGrams.push(sequence.slice(i, i + n));
    }
    return nGrams;
}
*/
